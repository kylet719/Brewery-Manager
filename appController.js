const express = require('express');
const appService = require('./appService');
const {StatusEnum} = require("./public/enum");

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/employees/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchEmployees(breweryName);
    res.json({ data: tableContent });
});

router.post("/insert-brewmaster", async (req, res) => {
    const { masterid, name, manages, specialty, yearsofexperience } = req.body;
    const insertResult = await appService.insertBrewMaster(masterid, name, manages, specialty, yearsofexperience);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/get-beers/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchBeers(breweryName);
    res.json({ data: tableContent });
});

router.put('/update-brewmaster-details/:masterid', async (req, res) => {
    const masterid = Number(req.params.masterid);
    const { updatedName, updatedExperience } = req.body;
    const updateResult = await appService.updateBrewMasterDetails(masterid, updatedName, updatedExperience);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: "Failed to update the BrewMaster details." });
    }
});


router.get('/get-beers-unmanaged/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchUnmanagedBeers(breweryName);
    res.json({ data: tableContent });
});

router.post("/insert-beer/", async (req, res) => {
    const { name, abv, vessel, volume, breweryName, postalCode } = req.body;
    const insertResult = await appService.insertBeer(name, abv, vessel, volume, breweryName, postalCode);
    if (insertResult === StatusEnum.SUCCESS) {
        res.json({ data: insertResult });
    } else if (insertResult === StatusEnum.DUPLICATE){
        res.status(400).json({ success: false });
    }else {
        res.status(500).json({ success: false });
    }
});

router.post("/search-beer", async (req, res) => {
    const { searchFields, beerColumns, logic, breweryName } = req.body;
    const searchResult = await appService.searchBeer(searchFields, beerColumns, logic, breweryName);
    console.log("ran results");
    if (searchResult) {
        res.json({ data: searchResult });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/delete-brewmaster/:id', async (req, res) => {
    const masterId = req.params.id.replace(/_/g, ' ');
    console.log(typeof (masterId));
    const deleteResult = await appService.deleteBrewMaster(masterId)

    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({
            success: false,
            message: "Failed to delete BrewMaster."
        });
    }
});

router.get('/get-beer-reviews/:id', async (req, res) => {
    const beerName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchBeerReviews(beerName);
    res.json({ data: tableContent });
});

router.get('/get-beer-average/:id', async (req, res) => {
    const beerName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchAverageRating(beerName);
    res.json({ data: tableContent });
});

router.get('/get-high-abv-brewers/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchHighABVBrewmaster(breweryName);
    res.json({ data: tableContent });
});

router.get('/get-avg-abv/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.averageABV(breweryName);
    res.json({ data: tableContent });
});

router.put('/update-brewmaster-manages/:masterid', async (req, res) => {
    const masterid = Number(req.params.masterid);
    const { newBeerName } = req.body;
    const updateResult = await appService.updateBrewMasterManages(masterid, newBeerName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: "Failed to update the BrewMaster's managed beer." });
    }
});

router.get('/get-brew-kettles/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.getBrewKettles(breweryName);
    res.json({ data: tableContent });
});

router.get('/get-fermenters/:id', async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.getFermenters(breweryName);
    res.json({ data: tableContent });
});

router.get(`/get-top-beers/:id`, async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchTopBeers(breweryName);
    res.json({data: tableContent});
});

router.get(`/get-top-customers/:id`, async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.fetchTopCustomers(breweryName);
    res.json({data: tableContent});
});

router.get(`/brewery-exists/:id`, async (req, res) => {
    const breweryName = req.params.id.replace(/_/g, ' ');
    const tableContent = await appService.breweryExists(breweryName);
    res.json({data: tableContent});
})

router.post("/insert-brewery", async (req, res) => {
    const { name, postalCode, streetAddress, province } = req.body;
    const insertResult = await appService.insertBrewery(name, postalCode, streetAddress, province);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

module.exports = router;