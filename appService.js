const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const {StatusEnum} = require("./public/enum");

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: '',
    password: '',
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMax: 1
};


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
let poolMade = false;
async function withOracleDB(action) {
    let connection;
    try {
        if (!poolMade) {
            await oracledb.createPool(dbConfig);
            poolMade = true;
        }

        connection = await oracledb.getConnection();
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertBrewMaster(masterid, name, manages, specialty, yearsofexperience) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO BREWMASTER (masterid, name, specialty, yearsofexperience) VALUES (:masterid, :name, :specialty, :yearsofexperience)`,
            [masterid, name, specialty, yearsofexperience],
            { autoCommit: true }
        );

        const malt = "Corn";
        const hops = "HalleCrtau";
        const batchId = 5;
        const yeast = "Brett Yeast";

        const result2 = await connection.execute(
            `INSERT INTO CRAFTING (masterid, BEERNAME, MALTTYPE, HOPSTYPE, BATCHID, STRAIN) 
            VALUES (:masterid, :manages, :malt, :hops, :batchId, :yeast)`,
            [masterid, manages, malt, hops, batchId, yeast],
            { autoCommit: true }
        );

        return result2.rowsAffected && result2.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

async function fetchEmployees(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT bm.MASTERID as ID, bm.NAME as Name, c.BEERNAME as Manages, YEARSOFEXPERIENCE as YearsWorked
            FROM produces p
            JOIN crafting c ON p.BeerName = c.BeerName
            JOIN brewmaster bm ON c.MasterID = bm.MasterID
            WHERE p.NAME LIKE :breweryName
        `, [breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchBeers(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT p.BEERNAME, b.ABV, S.TYPE, v.VOLUME
            FROM produces p
                     JOIN BEER B on B.NAME = p.BEERNAME
                     JOIN STORES S on B.NAME = S.BEERNAME
                     JOIN VESSEL V on V.TYPE = S.TYPE
            WHERE p.NAME LIKE :breweryName
        `, [breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteBrewMaster(masterid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            DELETE FROM BREWMASTER WHERE MASTERID = :masterid
            `, [masterid],
            { autoCommit: true }
        );
        return result.rowsAffected > 0;
    }).catch((error) => {
        console.error(error);
        return false;
    });
}
async function fetchUnmanagedBeers(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT p.BEERNAME
            FROM produces p
                     LEFT JOIN crafting c ON p.BeerName = c.BeerName
            WHERE p.NAME LIKE :breweryName AND c.BeerName IS NULL
        `, [breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function insertBeer(name, abv, vessel, volume, breweryName, postalCode) {
    // TODO: Don't commit until the very end.
    return await withOracleDB(async (connection) => {
        const existingVessels = await connection.execute(
            `SELECT COUNT(*) FROM VESSEL WHERE TYPE LIKE :vessel`,
            [vessel],
            { autoCommit: true }
        );

        if (existingVessels.rows[0][0] === 0 ) {
            const insertVessel = await connection.execute(
                `INSERT INTO Vessel VALUES (:vessel, :volume)`,
                [vessel, volume],
                { autoCommit: true }
            );
        }

        const existingBeer = await connection.execute(
            `SELECT COUNT(*) FROM Beer WHERE name LIKE :name`,
            [name],
            { autoCommit: true }
        );

        if (existingBeer.rows[0][0] !== 0 ) {
            return StatusEnum.DUPLICATE;
        }

        const beerInsert = await connection.execute(
            `INSERT INTO Beer VALUES (:name, :abv)`,
            [name, abv],
            { autoCommit: true }
        );

        const storesInsert = await connection.execute(
            `INSERT INTO Stores VALUES(:vessel, :name)`,
            [vessel, name],
            { autoCommit: true }
        );

        const result = await connection.execute(
            `INSERT INTO PRODUCES VALUES (:breweryName, :name, :postalCode)`,
            [breweryName, name, postalCode],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0 ? StatusEnum.SUCCESS : StatusEnum.FAIL
    }).catch(() => {
        return StatusEnum.FAIL;
    });
}

async function searchBeer(searchFields, beerColumns, logic, breweryName) {
    return await withOracleDB(async (connection) => {
        const selectClause = beerColumns.map(column => {
            switch (column.toUpperCase()) {
                case 'BEERNAME':
                    return 'p.BEERNAME';
                case 'ABV':
                    return 'b.ABV';
                case 'TYPE':
                    return 's.TYPE as Vessel';
                case 'VOLUME':
                    return 'v.VOLUME';
                default:
                    throw new Error(`Invalid column name: ${column}`);
            }
        }).join(', ');

        let whereClause = `p.NAME LIKE :breweryName`;
        const parameters = { breweryName: `%${breweryName}%` };

        searchFields.forEach((field, index) => {
            if (logic === 'NONE' && index > 0) {
                // Ignore the rest of fields since NONE selected
                return;
            }

            const paramName = `param${index}`;
            const searchType = field.searchType.toUpperCase();
            const searchValue = field.searchValue;
            let clause = '';

            switch (searchType) {
                case 'BEER':
                    clause = `p.BEERNAME LIKE :${paramName}`;
                    break;
                case 'ABV':
                    clause = `b.ABV = :${paramName}`;
                    break;
                case 'VESSEL':
                    clause = `v.TYPE LIKE :${paramName}`;
                    break;
                case 'VOLUME':
                    clause = `v.VOLUME = :${paramName}`;
                    break;
            }

            if (index === 0) {
                whereClause += ` AND (${clause}`;
            } else {
                whereClause += ` ${logic} ${clause}`;
            }

            parameters[paramName] = searchType === 'BEER' || searchType === 'VESSEL' ? `%${searchValue}%` : searchValue;
        });

        whereClause += ')';

        const query = `
            SELECT ${selectClause}
            FROM produces p
                     JOIN BEER b ON b.NAME = p.BEERNAME
                     JOIN STORES s ON b.NAME = s.BEERNAME
                     JOIN VESSEL v ON v.TYPE = s.TYPE
            WHERE ${whereClause}
        `;

        console.log(query);

        const result = await connection.execute(query, parameters);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchBeerReviews(beerName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            Select * from REVIEW WHERE BEERNAME LIKE :beerName
        `, [beerName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchAverageRating(beerName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            Select avg(RATING) from REVIEW WHERE BEERNAME LIKE :beerName GROUP BY BEERNAME
        `, [beerName]);
        console.log(result.rows[0][0])
        return result.rows[0][0];
    }).catch(() => {
        return [];
    });
}

async function fetchHighABVBrewmaster(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT bm.MASTERID, bm.Name, B.ABV
            FROM Brewmaster bm
                     JOIN CRAFTING C2 on bm.MASTERID = C2.MASTERID
                     JOIN PRODUCES P on C2.BEERNAME = P.BEERNAME
                     JOIN BEER B on B.NAME = C2.BEERNAME
            WHERE EXISTS (
                SELECT 1
                FROM CRAFTING p
                         JOIN Beer b ON p.BEERNAME = b.NAME
                WHERE bm.masterId = p.masterId AND b.abv > (SELECT AVG(abv) 
                                                            FROM Beer 
                                                            JOIN PRODUCES P2 on Beer.NAME = P2.BEERNAME 
                                                            WHERE P2.NAME LIKE :breweryName)
            )
              AND P.NAME LIKE :breweryName
        `, [breweryName, breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function averageABV(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT AVG(abv)
            FROM Beer
                     JOIN PRODUCES P2 on Beer.NAME = P2.BEERNAME
            WHERE P2.NAME LIKE :breweryName
        `, [breweryName]);
        return result.rows[0][0];
    }).catch(() => {
        return [];
    });
}

async function getBrewKettles(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT DISTINCT br.SERIALID, bk.MANUFACTURER, bk.MODEL
            FROM produces p
                     JOIN crafting c ON p.BeerName = c.BeerName
                     JOIN brewmaster bm ON c.MasterID = bm.MasterID
                     JOIN BREWS br on br.HOPSTYPE = c.HOPSTYPE AND br.MALTTYPE = c.MALTTYPE
                     JOIN BREWKETTLE bk on br.SERIALID = bk.SERIALID
            WHERE p.NAME LIKE :brewerName
        `, [breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getFermenters(breweryName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT DISTINCT ft.SERIALID,fer.MANUFACTURER, fer.MODEL
            FROM produces p
                     JOIN crafting c ON p.BeerName = c.BeerName
                     JOIN brewmaster bm ON c.MasterID = bm.MasterID
                     JOIN FERMENTS ft on c.STRAIN = ft.STRAIN
                     JOIN FERMENTER fer on fer.SERIALID = ft.SERIALID
            WHERE p.NAME LIKE :breweryName
        `, [breweryName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function updateBrewMasterManages(masterid, newBeerName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            UPDATE crafting
            SET BeerName=:newBeerName
            WHERE masterid=:masterid
        `, [newBeerName, masterid], { autoCommit: true });
        return result.rowsAffected > 0;
    }).catch((error) => {
        console.error(error);
        return false;
    });
}


async function updateBrewMasterDetails(masterid, updatedName, updatedExperience) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            UPDATE brewmaster
            SET NAME=:updatedName,
                YEARSOFEXPERIENCE=:updatedExperience
            WHERE MASTERID=:masterid
        `, [updatedName, updatedExperience, masterid], { autoCommit: true });
        return result.rowsAffected > 0;
    }).catch((error) => {
        console.error(error);
        return false;
    });
}

async function fetchTopBeers(breweryName) {
    return await withOracleDB(async(connection) => {
        const result = await connection.execute(`
            SELECT p.beerName, AVG(rating) as avgRating
            FROM PRODUCES p
                JOIN REVIEW r on r.beerName = P.beerName
            WHERE p.name = :breweryName
            GROUP BY p.beerName
            HAVING AVG(rating) >= 4
            ORDER BY avgRating DESC
            FETCH FIRST 3 ROWS ONLY
        `, [breweryName]);
        console.log(result.rows);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchTopCustomers(breweryName) {
    return await withOracleDB(async(connection) => {
        const result = await connection.execute(`
            SELECT *
            FROM Customer c
            WHERE NOT EXISTS (
                (SELECT b.name FROM Beer b JOIN Produces p ON b.name = p.beername WHERE p.name LIKE :breweryName)
                MINUS
                (SELECT r.beername FROM REVIEW r WHERE r.customerId = c.customerId)
            )
        `, [breweryName]);
        console.log(result.rows);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function breweryExists(breweryName) {
    return await withOracleDB(async(connection) => {
        const result = await connection.execute(`
            SELECT COUNT(*)
            FROM BREWERY
            WHERE NAME = :breweryName
        `, [breweryName]);
        console.log(result.rows);
        return result.rows > 0;
    })
}

async function insertBrewery(name, postalCode, streetAddress, province) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO BREWERY (name, postalCode, streetAddress, province) VALUES (:name, :postalCode, :streetAddress, :province)`,
            [name, postalCode, streetAddress, province],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

module.exports = {
    testOracleConnection,
    insertBrewMaster,
    insertBeer,
    fetchEmployees,
    fetchBeers,
    fetchUnmanagedBeers,
    searchBeer,
    deleteBrewMaster,
    fetchBeerReviews,
    fetchAverageRating,
    fetchHighABVBrewmaster,
    averageABV,
    updateBrewMasterManages,
    updateBrewMasterDetails,
    getBrewKettles,
    getFermenters,
    fetchTopBeers,
    fetchTopCustomers,
    breweryExists,
    insertBrewery
};
