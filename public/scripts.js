/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */
let breweryName = localStorage.getItem("breweryName") ?? 'Uhhh';
let postalCode = localStorage.getItem("postalCode") ?? 'Uhhh';
document.addEventListener('DOMContentLoaded', async (event) => {
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        breweryName = document.getElementById('brewName').value;
        window.localStorage.setItem("breweryName", breweryName);
        postalCode = document.getElementById('pc').value;
        window.localStorage.setItem("postalCode", postalCode);

        const response = await fetch(`/brewery-exists/${encodeURI(breweryName)}`, {method: "GET"});
        const responseData = await response.json();
        const breweryExists = responseData.data;

        if (breweryExists) {
            window.location.href = `brewery.html`;
        } else {
            alert("Brewery does not exist! Please check credentials or create brewery.");
        }
    });

    await populateBeerDropdown();
});

document.addEventListener("DOMContentLoaded", async(event) => {
    document.getElementById("signupForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const newBreweryName = document.getElementById("newBrewName").value;
        const newPostalCode = document.getElementById("newPc").value;
        const newAddress = document.getElementById("newAddress").value;
        const newProvince = document.getElementById("newProvince").value;

        const response = await fetch("insert-brewery", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({
                name: newBreweryName,
                postalCode: newPostalCode,
                streetAddress: newAddress,
                province: newProvince
            })
        });
        const responseData = await response.json();

        if (responseData.success) {
            alert("Add successful!");

            toggleForm();
            document.getElementById("brewName").setAttribute("value", newBreweryName);
            document.getElementById("pc").setAttribute("value", newPostalCode);
        } else {
            alert("Add unsuccessful!");
        }
    })
})

function toggleForm() {
    const signupDiv = document.getElementById("signup");
    const loginDiv = document.getElementById("login");

    signupDiv.hidden = !signupDiv.hidden;
    loginDiv.hidden = !loginDiv.hidden;
}


document.getElementById('insertBrewMasterForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const masterId = document.getElementById('brewMasterId').value;
    const name = document.getElementById('brewMasterName').value;
    const manages = document.getElementById('brewMasterBeer').value;
    const specialty = document.getElementById('brewMasterSpecialty').value;
    const experience = document.getElementById('brewMasterExperience').value;

    const response = await fetch('/insert-brewmaster', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            masterid: masterId,
            name: name,
            manages: manages,
            specialty: specialty,
            yearsofexperience: experience
        })
    });

    const responseData = await response.json();
    const resultElement = document.getElementById('insertBrewMasterResult');

    if (responseData.success) {
        resultElement.textContent = "BrewMaster added successfully!";
        fetchAndDisplayBrewmaster();
    } else {
        resultElement.textContent = "Error adding BrewMaster!";
    }
});


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        });
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayBrewmaster() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    tableBody.innerHTML = '';

    //fetch the current brewmasters and their managed beers
    const response = await fetch(`/employees/${encodeURI(breweryName)}`, { method: 'GET' });
    const responseData = await response.json();
    const demotableContent = responseData.data;

    //fetch the list of unmanaged beers
    const unManagedResponse = await fetch(`/get-beers-unmanaged/${encodeURI(breweryName)}`, { method: 'GET' });
    const unManagedResponseData = await unManagedResponse.json();
    const unmanagedBeers = unManagedResponseData.data;

    demotableContent.forEach((employee) => {
        const row = tableBody.insertRow();
        const masterId = employee[0];

        employee.forEach((field, index) => {
            const cell = row.insertCell(index);

            if (index === 1 || index === 3) {
                const inputField = document.createElement('input');
                inputField.type = (index === 1) ? 'text' : 'number';
                inputField.value = field;
                cell.appendChild(inputField);
            } else if (index === 2) {
                const updateDropdown = document.createElement('select');
                unmanagedBeers.forEach(beer => {
                    const option = document.createElement('option');
                    option.value = beer[0];
                    option.textContent = beer[0];
                    updateDropdown.appendChild(option);
                });

                const currentBeerOption = document.createElement('option');
                currentBeerOption.value = field;
                currentBeerOption.textContent = field;
                currentBeerOption.selected = true;
                updateDropdown.appendChild(currentBeerOption);

                cell.appendChild(updateDropdown);
            } else {
                cell.textContent = field;
            }
        });

        //add Update and Delete buttons
        const actionCell = row.insertCell();
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.onclick = () => {
            const updatedName = row.cells[1].querySelector('input').value;
            const updatedExperience = Number(row.cells[3].querySelector('input').value);
            const updatedBeer = row.cells[2].querySelector('select').value;
            updateBrewMasterDetails(masterId, updatedName, updatedExperience);
            updateBrewMasterManages(masterId, updatedBeer);
        };
        actionCell.appendChild(updateButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteBrewMaster(masterId);
        actionCell.appendChild(deleteButton);
    });
}



async function updateBrewMasterManages(masterId, newBeerName) {
    const response = await fetch(`/update-brewmaster-manages/${masterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBeerName: newBeerName })
    });

    const responseData = await response.json();
    if (responseData.success) {
        alert("BrewMaster's managed beer updated successfully!");
        fetchTableData();
        await populateBeerDropdown();
    } else {
        alert("Error updating BrewMaster's managed beer!");
    }
}

async function updateBrewMasterDetails(masterId, updatedName, updatedExperience) {
    const response = await fetch(`/update-brewmaster-details/${masterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            updatedName: updatedName,
            updatedExperience: updatedExperience
        })
    });

    const responseData = await response.json();
    if (responseData.success) {
        alert("BrewMaster details updated successfully!");
    } else {
        alert("Error updating BrewMaster details!");
    }
}


async function deleteBrewMaster(masterId) {
    const response = await fetch(`/delete-brewmaster/${encodeURI(masterId)}`, {
        method: 'DELETE'
    });

    const responseData = await response.json();

    if (responseData.success) {
        alert("BrewMaster deleted successfully!");
        fetchTableData();
    } else {
        alert("Error deleting BrewMaster!");
    }
}

async function populateBeerDropdown() {

    const response = await fetch(`/get-beers-unmanaged/${encodeURI(breweryName)}`, {
        method: 'GET'
    });
    const responseData = await response.json();

    const dropdown = document.getElementById('brewMasterBeer');
    const unmanagedBeers = responseData.data;

    dropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Choose a Beer';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);

    unmanagedBeers.forEach((beer) => {
        const option = document.createElement('option');
        option.value = beer[0];
        option.text = beer[0];
        dropdown.appendChild(option);
    });
}

async function populateBeerTable() {
    const response2 = await fetch(`/get-beers/${encodeURI(breweryName)}`, {
        method: 'GET'
    });
    const responseData2 = await response2.json();
    const allBeers = responseData2.data;

    const tableElement = document.getElementById('beerTable');
    const tableBody = tableElement.querySelector('tbody');

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const tableHead = tableElement.querySelector('thead tr');
    tableHead.innerHTML = '';

    const beerColumns = ["BEERNAME", "ABV", "VESSEL", "VOLUME"]
    beerColumns.forEach(column => {
        const header = document.createElement('th');
        switch (column) {
            case 'BEERNAME':
                header.textContent = 'Beer Name';
                break;
            case 'ABV':
                header.textContent = 'ABV';
                break;
            case 'VESSEL':
                header.textContent = 'Vessel';
                break;
            case 'VOLUME':
                header.textContent = 'Volume';
                break;
            default:
                header.textContent = column;
                break;
        }
        tableHead.appendChild(header);
    });

    allBeers.forEach(beerData => {
        const row = tableBody.insertRow();
        beerData.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === 0) {
                const anchor = document.createElement('a');
                anchor.href = `/beer.html?Beer=${encodeURIComponent(field)}`;
                anchor.textContent = field;
                cell.appendChild(anchor);
            } else {
                cell.textContent = field;
            }
        });
    });
}

async function resetBeerTable() {
    populateBeerTable();
}

// Inserts new records into the brew master table.
// async function insertBrewMaster(event) {
//     event.preventDefault();
//
//     const masterId = document.getElementById('brewMasterId').value;
//     const name = document.getElementById('brewMasterName').value;
//     const specialty = document.getElementById('brewMasterSpecialty').value;
//     const experience = document.getElementById('brewMasterExperience').value;
//
//     const response = await fetch('/insert-brewmaster', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             masterid: masterId,
//             name: name,
//             specialty: specialty,
//             yearsofexperience: experience
//         })
//     });
//
//     const responseData = await response.json();
//     const messageElement = document.getElementById('insertResultMsg');
//
//     if (responseData.success) {
//         messageElement.textContent = "Data inserted successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error inserting data!";
//     }
// }


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
// window.onload = function() {
//     checkDbConnection();
//     fetchTableData();
//     document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
//     document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
//     document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
//     document.getElementById("countDemotable").addEventListener("click", countDemotable);
// };

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayBrewmaster();
}

function DisplayBreweryName() {
    const statusElem = document.getElementById('BreweryName');
    const statusElem2 = document.getElementById('zipCodeHeading');
    statusElem.textContent = breweryName;
    statusElem2.textContent = postalCode;
}


async function insertDemotable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

async function insertBeerTable(event) {
    console.log("IM HERE");
    event.preventDefault();

    const name = document.getElementById('beerNameInput').value;
    const abv = document.getElementById('abvInput').value;
    const vessel = document.getElementById('vesselInput').value;
    const volume = document.getElementById('volumeInput').value;


    const response = await fetch('/insert-beer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            abv: abv,
            vessel: vessel,
            volume: volume,
            breweryName: breweryName,
            postalCode: postalCode
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertBeerMsg');

    if (response.status === 200) {
        messageElement.textContent = "Data inserted successfully!";
        resetBeerTable();
        await populateBeerDropdown();
    } else {
        messageElement.textContent = response.status === 400 ? "Beer Name is taken." :"Error inserting data!";
    }
}

async function getSearchFields(event) {
    event.preventDefault();

    const messageElement = document.getElementById('searchFieldMsg');
    const searchFields = document.querySelectorAll('.searchField');
    const columnElement = document.getElementById('beerColumnMsg');

    const checkboxes = document.querySelectorAll('input[name="columns"]:checked');
    const beerColumns = Array.from(checkboxes).map(checkbox => checkbox.value);
    if (beerColumns.length === 0) {
        columnElement.textContent = 'Choose at least one column for search.'
        return;
    }

    columnElement.textContent = '';

    let searchData = [];
    let errorOccurred = false;

    for (const field of searchFields) {
        const searchType = field.querySelector('select[name="SearchType"]').value;
        const searchValue = field.querySelector('input[name="SearchValue"]').value;

        if ((searchType === 'ABV' || searchType === 'Volume') && isNaN(searchValue)) {
            messageElement.textContent = `${searchType} must be a number.`;
            errorOccurred = true;
            break; // Stop the loop
        } else {
            messageElement.textContent = "";
            searchData.push({ searchType, searchValue });
        }
    }

    if (errorOccurred) {
        return;
    }

    const logic = document.getElementById('SearchLogic').value;
    const response = await fetch('/search-beer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            searchFields: searchData,
            beerColumns: beerColumns,
            logic: logic,
            breweryName: breweryName
        })
    });

    const responseData = await response.json();
    const allBeers = responseData.data;

    const tableElement = document.getElementById('beerTable');
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const tableHead = tableElement.querySelector('thead tr');
    tableHead.innerHTML = '';

    beerColumns.forEach(column => {
        const header = document.createElement('th');
        switch (column) {
            case 'BEERNAME':
                header.textContent = 'Beer Name';
                break;
            case 'ABV':
                header.textContent = 'ABV';
                break;
            case 'VESSEL':
                header.textContent = 'Vessel';
                break;
            case 'VOLUME':
                header.textContent = 'Volume';
                break;
            case 'TYPE':
                header.textContent = 'Vessel';
                break;
            default:
                header.textContent = column;
                break;
        }
        tableHead.appendChild(header);
    });


    allBeers.forEach(beerData => {
        const row = tableBody.insertRow();
        beerData.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === 0 && beerColumns[0] === 'BEERNAME') {
                const anchor = document.createElement('a');
                anchor.href = `/beer.html?Beer=${encodeURIComponent(field)}`;
                anchor.textContent = field;
                cell.appendChild(anchor);
            } else {
                cell.textContent = field;
            }
        });
    });
}

function addSearchField() {
    const container = document.getElementById('searchFields');
    const newField = document.createElement('div');
    newField.classList.add('searchField');
    newField.innerHTML = `
        <select name="SearchType">
            <option value="Beer">Beer</option>
            <option value="ABV">ABV</option>
            <option value="Vessel">Vessel</option>
            <option value="Volume">Volume</option>
        </select>
        <input type="text" name="SearchValue">
        <span class="removeField" onclick="removeSearchField(this)">&times;</span>
    `;
    container.appendChild(newField);
}

// Function to remove a search field
function removeSearchField(element) {
    const fieldToRemove = element.parentNode;
    fieldToRemove.parentNode.removeChild(fieldToRemove);
}

async function fetchBeerReviews(beerName) {
    const tableElement = document.getElementById('reviewTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/get-beer-reviews/${encodeURI(beerName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchBeerAverageScore(beerName) {
    const tableElement = document.getElementById('reviewTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/get-beer-average/${encodeURI(beerName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const averageRating = responseData.data;

    const statusElem = document.getElementById('averageRating');
    statusElem.textContent = `Average Rating: ${averageRating}`
}

function displayBeerReviewPage(beerName) {
    const statusElem = document.getElementById('BeerNameTitle');
    statusElem.textContent = `${beerName} Summary Page`
}

async function fetchHighAbvBrewers() {
    const abvDiv = document.getElementById('abvTableAndWords');
    const tableElement = document.getElementById('abvTable');
    abvDiv.hidden = false;
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const response = await fetch(`/get-high-abv-brewers/${encodeURI(breweryName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const highAbvBrewers = responseData.data;

    highAbvBrewers.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });

    await fetchAverageAbv();
}

async function fetchAverageAbv() {
    const abvDiv = document.getElementById('averageAbvValue');

    const response = await fetch(`/get-avg-abv/${encodeURI(breweryName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const averageAbv = responseData.data;

    abvDiv.textContent = `The average ABV for your brewery is : ${(Math.round(averageAbv * 100) / 100).toFixed(2)}`
}

function hideAbvQuery() {
    const abvDiv = document.getElementById('abvTableAndWords');
    abvDiv.hidden = true;
}

function fetchEquipment(){

}

async function fetchBrewKettles() {
    const tableElement = document.getElementById('brewKettleTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/get-brew-kettles/${encodeURI(breweryName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const brewKettles = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    brewKettles.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchFermenters() {
    const tableElement = document.getElementById('fermenterTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/get-fermenters/${encodeURI(breweryName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const fermenters = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    fermenters.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchTopBeers() {
    const topBeersDiv = document.getElementById("topBeersTableDiv");
    const tableElement = document.getElementById("topBeersTable");

    topBeersDiv.hidden = false;
    const tableBody = tableElement.querySelector("tbody");

    if (tableBody) {
        tableBody.innerHTML = "";
    }

    const response = await fetch(`/get-top-beers/${encodeURI(breweryName)}`, {
        method: "GET"
    });

    const responseData = await response.json();
    const topBeers = responseData.data;

    topBeers.forEach(beer => {
        const row = tableBody.insertRow();
        beer.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

function hideTopBeers() {
    const topBeersDiv = document.getElementById("topBeersTableDiv");
    topBeersDiv.hidden = true;
}

async function fetchTopCustomers() {
    const tableElement = document.getElementById("customersTable");
    const tableBody = tableElement.querySelector("tbody");

    if (tableBody) {
        tableBody.innerHTML = "";
    }

    const response = await fetch(`/get-top-customers/${encodeURI(breweryName)}`, {
        method: "GET"
    });

    const responseData = await response.json();
    const topCustomers = responseData.data;

    topCustomers.forEach(beer => {
        const row = tableBody.insertRow();
        beer.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

