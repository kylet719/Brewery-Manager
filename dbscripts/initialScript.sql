drop table stores;
drop table produces;
drop table sanitize;
drop table drankby;
drop table crafting;
drop table ferments;
drop table brews;
drop table review;
drop table customer;
drop table vessel;
drop table beer;
drop table brewery;
drop table brewmaster;
drop table fermenter;
drop table brewkettle;
drop table wort;
drop table yeast;
drop table hops;
drop table malt;

create table malt
(malttype varchar(100) not null,
 origin varchar(100) null,
 primary key (malttype));

create table hops
(hopstype varchar(100) not null,
 origin varchar(100) null,
 primary key (hopstype));

create table yeast
(strain varchar(100) not null primary key);

create table wort
(batchid integer not null primary key,
 DATETIME date null);

create table brewkettle
(serialid integer not null primary key,
 manufacturer varchar(100) null,
 model varchar(100) null,
 volume integer null);

create table fermenter
(serialid integer not null primary key,
 manufacturer varchar(100) null,
 model varchar(100) null,
 type varchar(100) null);

create table brewmaster
(masterid integer not null primary key,
 name varchar(100) null,
 specialty varchar(100) null,
 yearsofexperience integer null);

create table brewery
(name varchar(100) not null primary key,
 postalcode char(6) null unique ,
 streetaddress varchar(200) null,
 province char(2) null);

create table beer
(name varchar(100) not null primary key,
 abv float null);

create table vessel
(type varchar(100) not null primary key,
 volume integer null);

create table customer
(customerid integer not null primary key,
 customername varchar(100) null,
 favouritebeertype varchar(100) null);

create table review
(customerid integer null,
 beername varchar(100) null,
 reviewdate date null,
 rating integer null,
 comments varchar(500) null,
 foreign key (customerid) references customer(customerid)
     on delete cascade,
 foreign key (beername) references beer(name)
     on delete cascade);

create table brews
(malttype varchar(100) not null,
 hopstype varchar(100) not null,
 serialid integer null,
 batchid integer not null,
 primary key (malttype, hopstype),
 foreign key (serialid) references brewkettle(serialid)
     on delete cascade,
 foreign key (malttype) references malt(malttype)
     on delete cascade,
 foreign key (hopstype) references hops(hopstype)
     on delete cascade,
 foreign key (batchid) references wort(batchid)
     on delete cascade);

create table ferments
(batchid integer not null,
 strain varchar(100) null,
 serialid integer null,
 primary key (batchid),
 foreign key (batchid) references wort(batchid)
     on delete cascade,
 foreign key (strain) references yeast(strain)
     on delete cascade,
 foreign key (serialid) references fermenter(serialid)
     on delete cascade);

create table crafting
(masterid integer not null,
 beername varchar(100) null,
 malttype varchar(100) null,
 hopstype varchar(100) null,
 batchid integer null,
 strain varchar(100) null,
 primary key (masterid),
 foreign key (masterid) references brewmaster(masterid)
     on delete cascade,
 foreign key (beername) references beer(name)
     on delete cascade,
 foreign key (malttype) references malt(malttype)
     on delete cascade,
 foreign key (hopstype) references hops(hopstype)
     on delete cascade,
 foreign key (batchid) references wort(batchid)
     on delete cascade,
 foreign key (strain) references yeast(strain)
     on delete cascade);

create table drankby
(customerid integer not null,
 beername varchar(100) null,
 primary key (customerid),
 foreign key (customerid) references customer(customerid)
     on delete cascade,
 foreign key (beername) references beer(name)
     on delete cascade);

create table sanitize
(serialid integer not null,
 masterid integer null,
 primary key (serialid),
 foreign key (serialid) references brewkettle(serialid)
     on delete cascade,
 foreign key (masterid) references brewmaster(masterid)
     on delete cascade);

create table produces
(name varchar(100) not null,
 beername varchar(100) not null,
 postalcode char(6) not null,
 primary key (name, beername, postalcode),
 foreign key (name) references brewery(name)
     on delete cascade,
 foreign key (beername) references beer(name)
     on delete cascade,
 foreign key (postalcode) references brewery(postalcode)
     on delete cascade);

create table stores
(type varchar(100) not null,
 beername varchar(100) not null,
 primary key (type, beername),
 foreign key (type) references vessel(type)
     on delete cascade,
 foreign key (beername) references beer(name)
     on delete cascade);

INSERT INTO Malt VALUES ('Barley', 'Germany');
INSERT INTO Malt VALUES ('Wheat', 'USA');
INSERT INTO Malt VALUES ('Rye', 'Canada');
INSERT INTO Malt VALUES ('Oats', 'UK');
INSERT INTO Malt VALUES ('Corn', 'Mexico');

INSERT INTO Hops VALUES ('Cascade', 'USA');
INSERT INTO Hops VALUES ('Amarillo', 'USA');
INSERT INTO Hops VALUES ('Fuggle', 'UK');
INSERT INTO Hops VALUES ('Saaz', 'Czech Republic');
INSERT INTO Hops VALUES ('HalleCrtau', 'Germany');

INSERT INTO Yeast VALUES ('Ale Yeast');
INSERT INTO Yeast VALUES ('Lager Yeast');
INSERT INTO Yeast VALUES ('Wheat Yeast');
INSERT INTO Yeast VALUES ('Saison Yeast');
INSERT INTO Yeast VALUES ('Brett Yeast');

INSERT INTO Wort VALUES (1, '2023-10-01');
INSERT INTO Wort VALUES (2, '2023-10-05');
INSERT INTO Wort VALUES (3, '2023-10-10');
INSERT INTO Wort VALUES (4, '2023-10-15');
INSERT INTO Wort VALUES (5, '2023-10-20');

INSERT INTO BrewKettle VALUES (1001, 'KettleCo', 'ModelA', 500);
INSERT INTO BrewKettle VALUES (1002, 'BrewTech', 'ModelX', 550);
INSERT INTO BrewKettle VALUES (1003, 'BrewPro', 'ModelZ', 600);
INSERT INTO BrewKettle VALUES (1004, 'KettleTech', 'ModelM', 650);
INSERT INTO BrewKettle VALUES (1005, 'KettleCraft', 'ModelV', 700);

INSERT INTO Fermenter VALUES (2001, 'FermTech', 'Alpha', 'Stainless');
INSERT INTO Fermenter VALUES (2002, 'FermCraft', 'Beta', 'Glass');
INSERT INTO Fermenter VALUES (2003, 'BrewFerm', 'Gamma', 'Stainless');
INSERT INTO Fermenter VALUES (2004, 'CraftyFerm', 'Delta', 'Plastic');
INSERT INTO Fermenter VALUES (2005, 'QuickFerm', 'Theta', 'Glass');

INSERT INTO BrewMaster VALUES (1, 'Lebron James', 'Ale', 10);
INSERT INTO BrewMaster VALUES (2, 'Josh Smith', 'Stout', 8);
INSERT INTO BrewMaster VALUES (3, 'Austin Reeves', 'IPA', 5);
INSERT INTO BrewMaster VALUES (4, 'Ben Simmons', 'Lager', 6);
INSERT INTO BrewMaster VALUES (5, 'Elsa White', 'Pilsner', 12);

INSERT INTO Brewery VALUES ('CraftyAles', 'V5A3A8', '123 Brew St', 'BC');
INSERT INTO Brewery VALUES ('HopHeads', 'V6B2T9', '456 Hop Ln', 'BC');
INSERT INTO Brewery VALUES ('MaltMasters', 'V7C1V2', '789 Malt Dr', 'BC');
INSERT INTO Brewery VALUES ('SunnyBrews', 'V8D4H5', '321 Sunny Blvd', 'BC');
INSERT INTO Brewery VALUES ('MoonlightBeers', 'V9E6G7', '654 Moon St', 'BC');

INSERT INTO Beer VALUES ('Sunny IPA', 5.5);
INSERT INTO Beer VALUES ('Moonlight Stout', 6.0);
INSERT INTO Beer VALUES ('Crafty Ale', 5.0);
INSERT INTO Beer VALUES ('Hoppy Lager', 4.5);
INSERT INTO Beer VALUES ('Malty Pilsner', 4.8);

INSERT INTO Vessel VALUES ('Barrel', 200);
INSERT INTO Vessel VALUES ('Bottle', 0.5);
INSERT INTO Vessel VALUES ('Can', 0.33);
INSERT INTO Vessel VALUES ('Growler', 1.89);
INSERT INTO Vessel VALUES ('Keg', 50);

INSERT INTO Customer VALUES (101, 'Kyle', 'IPA');
INSERT INTO Customer VALUES (102, 'Mia', 'Stout');
INSERT INTO Customer VALUES (103, 'Mo', 'Ale');
INSERT INTO Customer VALUES (104, 'Sophia', 'Lager');
INSERT INTO Customer VALUES (105, 'Dave', 'Pilsner');

INSERT INTO Crafting VALUES(1, 'Sunny IPA', 'Barley', 'Cascade', 1, 'Ale Yeast');
INSERT INTO Crafting VALUES(2, 'Moonlight Stout', 'Barley', 'Amarillo', 2, 'Lager Yeast');
INSERT INTO Crafting VALUES(3, 'Crafty Ale', 'Rye', 'Fuggle', 3, 'Wheat Yeast');
INSERT INTO Crafting VALUES(4, 'Hoppy Lager', 'Corn', 'Saaz', 4, 'Saison Yeast');
INSERT INTO Crafting VALUES(5, 'Malty Pilsner', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');

INSERT INTO DrankBy VALUES(101, 'Sunny IPA');
INSERT INTO DrankBy VALUES(102, 'Moonlight Stout');
INSERT INTO DrankBy VALUES(103, 'Crafty Ale');
INSERT INTO DrankBy VALUES(104, 'Hoppy Lager');
INSERT INTO DrankBy VALUES(105, 'Malty Pilsner');

INSERT INTO Sanitize VALUES(1001, 1);
INSERT INTO Sanitize VALUES(1002, 2);
INSERT INTO Sanitize VALUES(1003, 3);
INSERT INTO Sanitize VALUES(1004, 4);
INSERT INTO Sanitize VALUES(1005, 5);

INSERT INTO Produces VALUES('CraftyAles', 'Sunny IPA', 'V5A3A8');
INSERT INTO Produces VALUES('HopHeads', 'Moonlight Stout', 'V6B2T9');
INSERT INTO Produces VALUES('MaltMasters', 'Crafty Ale', 'V7C1V2');
INSERT INTO Produces VALUES('SunnyBrews', 'Hoppy Lager', 'V8D4H5');
INSERT INTO Produces VALUES('MoonlightBeers', 'Malty Pilsner', 'V9E6G7');

INSERT INTO Stores VALUES('Barrel', 'Sunny IPA');
INSERT INTO Stores VALUES('Bottle', 'Moonlight Stout');
INSERT INTO Stores VALUES('Can', 'Crafty Ale');
INSERT INTO Stores VALUES('Growler', 'Hoppy Lager');
INSERT INTO Stores VALUES('Keg', 'Malty Pilsner');

INSERT INTO Review VALUES (101, 'Sunny IPA', '2023-10-19', 4, 'Great hoppy taste. Refreshing!');
INSERT INTO Review VALUES (102, 'Moonlight Stout', '2023-10-15', 5, 'Love the rich and creamy texture. Perfect for a cold evening.');
INSERT INTO Review VALUES (103, 'Crafty Ale', '2023-10-10', 3, 'Decent ale, but lacks a distinctive flavor.');
INSERT INTO Review VALUES (104, 'Hoppy Lager', '2023-10-08', 4, 'Nice balance of hops and malt. Good for a casual drink.');
INSERT INTO Review VALUES (105, 'Malty Pilsner', '2023-10-05', 2, 'A bit too malty for my taste. Not my favorite pilsner.');

INSERT INTO Brews (maltType, hopsType, serialId, batchId) VALUES ('Barley', 'Cascade', 1001, 1);
INSERT INTO Brews (maltType, hopsType, serialId, batchId) VALUES ('Wheat', 'Amarillo', 1002, 2);
INSERT INTO Brews (maltType, hopsType, serialId, batchId) VALUES ('Rye', 'Fuggle', 1003, 3);
INSERT INTO Brews (maltType, hopsType, serialId, batchId) VALUES ('Oats', 'Saaz', 1004, 4);
INSERT INTO Brews (maltType, hopsType, serialId, batchId) VALUES ('Corn', 'HalleCrtau', 1005, 5);

INSERT INTO Ferments (batchId, strain, serialId) VALUES (1, 'Ale Yeast', 2001);
INSERT INTO Ferments (batchId, strain, serialId) VALUES (2, 'Lager Yeast', 2002);
INSERT INTO Ferments (batchId, strain, serialId) VALUES (3, 'Wheat Yeast', 2003);
INSERT INTO Ferments (batchId, strain, serialId) VALUES (4, 'Saison Yeast', 2004);
INSERT INTO Ferments (batchId, strain, serialId) VALUES (5, 'Brett Yeast', 2005);

INSERT INTO Beer VALUES ('Red Rocket', 4.8);
INSERT INTO Beer VALUES ('Sour Sour', 4.8);
INSERT INTO Beer VALUES ('Spicy Drink', 4.8);
INSERT INTO Beer VALUES ('Big Dog', 4.8);
INSERT INTO Stores VALUES('Barrel', 'Red Rocket');
INSERT INTO Stores VALUES('Barrel', 'Sour Sour');
INSERT INTO Stores VALUES('Barrel', 'Spicy Drink');
INSERT INTO Stores VALUES('Barrel', 'Big Dog');

INSERT INTO Produces VALUES('CraftyAles', 'Red Rocket', 'V5A3A8');
INSERT INTO Produces VALUES('CraftyAles', 'Sour Sour', 'V5A3A8');
INSERT INTO Produces VALUES('CraftyAles', 'Spicy Drink', 'V5A3A8');
INSERT INTO Produces VALUES('CraftyAles', 'Big Dog', 'V5A3A8');
INSERT INTO BrewMaster VALUES (6, 'Lebron James I', 'Ale', 10);
INSERT INTO BrewMaster VALUES (7, 'Lebron James II', 'Ale', 10);
INSERT INTO BrewMaster VALUES (8, 'Lebron James III', 'Ale', 10);
INSERT INTO BrewMaster VALUES (9, 'Lebron James IV', 'Ale', 10);
INSERT INTO BrewMaster VALUES (10, 'Lebron James V', 'Ale', 10);
INSERT INTO Crafting VALUES(6, 'Red Rocket', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');
INSERT INTO Crafting VALUES(7, 'Sour Sour', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');
INSERT INTO Crafting VALUES(8, 'Big Dog', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');
INSERT INTO Crafting VALUES(9, 'Spicy Drink', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');

INSERT INTO Review VALUES (101, 'Big Dog', '2023-11-27', 5, 'Balanced flavors, smooth finish — a delightful sip.');
INSERT INTO Review VALUES (101, 'Red Rocket', '2023-10-19', 4, 'Great hoppy taste. Refreshing!');
INSERT INTO Review VALUES (101, 'Sour Sour', '2023-11-25', 5, 'Exhilarating zest, a burst of tangy delight.');
INSERT INTO Review VALUES (101, 'Spicy Drink', '2023-11-11', 2, 'Spicy Drink struggles with an overpowering heat, lacking a balanced flavor profile.');
INSERT INTO Review VALUES (101, 'Sunny IPA', '2023-11-01', 3, 'Underwhelming hop profile, lacks depth; moderate bitterness, but falls short on delivering the sunny, vibrant punch expected in an IPA.');

INSERT INTO Review VALUES (102, 'Big Dog', '2023-11-05', 4, 'Big Dog: Bold, balanced, impressive – a standout at 4/5.');
INSERT INTO Review VALUES (102, 'Red Rocket', '2023-10-15', 5, 'Love the rich and creamy texture. Perfect for a cold evening.');
INSERT INTO Review VALUES (102, 'Sour Sour', '2023-11-25', 5, 'Tangy zest with a punch of flavor, a lively and refreshing twist.');
INSERT INTO Review VALUES (102, 'Spicy Drink', '2023-10-11', 1, 'Overwhelmed by an aggressive heat, lacking balance, and leaving a harsh, lingering aftertaste.');
INSERT INTO Review VALUES (102, 'Sunny IPA', '2023-11-01', 3, 'This IPA boasts a robust hop character, striking a balance between bitterness and flavor.');

INSERT INTO Review VALUES (103, 'Big Dog', '2023-11-27', 4, 'Big Dog impresses with bold, balanced flavors—a top choice.');
INSERT INTO Review VALUES (103, 'Red Rocket', '2023-10-10', 3, 'Decent ale, but lacks a distinctive flavor.');
INSERT INTO Review VALUES (103, 'Sour Sour', '2023-11-25', 5, 'This sour is a burst of tangy delight, vibrant and refreshing—a must-try for sour enthusiasts.');
INSERT INTO Review VALUES (103, 'Spicy Drink', '2023-10-12', 1, 'The aggressive heat overshadows any nuanced flavors, leaving an unbalanced and overwhelming experience.');
INSERT INTO Review VALUES (103, 'Sunny IPA', '2023-11-24', 4, 'This IPA shines with a bold hop profile, delivering a satisfying balance of bitterness and flavor.');

INSERT INTO Review VALUES (104, 'Big Dog', '2023-02-04', 5, 'Smooth, crisp, and refreshing—a classic lager that hits all the right notes.');
INSERT INTO Review VALUES (104, 'Red Rocket', '2023-10-08', 4, 'Nice balance of hops and malt. Good for a casual drink.');
INSERT INTO Review VALUES (104, 'Sour Sour', '2023-11-25', 4, 'This sour is a flavorful delight—vibrant tang, refreshing zest, a solid 4/5 choice.');
INSERT INTO Review VALUES (104, 'Spicy Drink', '2023-08-11', 1, 'This drink sadly missed the mark entirely.');
INSERT INTO Review VALUES (104, 'Sunny IPA', '2023-11-01', 4, 'An IPA with robust hops, balanced bitterness, definitely a 4/5 experience.');

INSERT INTO Review VALUES (105, 'Big Dog', '2023-11-27', 4, 'Big Dog impresses with its bold flavor and smooth delivery, a confident 4/5 choice.');
INSERT INTO Review VALUES (105, 'Red Rocket', '2023-10-05', 2, 'A bit too malty for my taste. Not my favorite pilsner.');
INSERT INTO Review VALUES (105, 'Sour Sour', '2023-07-25', 5, 'A zesty burst of tanginess, truly refreshing and vibrant—a must-try for sour lovers.');
INSERT INTO Review VALUES (105, 'Spicy Drink', '2023-10-11', 1, 'Overpowering heat, no flavor relief—a disappointing sip.');
INSERT INTO Review VALUES (105, 'Sunny IPA', '2023-11-01', 3, 'This IPA is alright, nothing exceptional—just a regular brew.');

INSERT INTO Beer VALUES ('TheSpicy', 500);
INSERT INTO Stores VALUES('Barrel', 'TheSpicy');
INSERT INTO Produces VALUES('CraftyAles', 'TheSpicy', 'V5A3A8');
INSERT INTO Crafting VALUES(10, 'TheSpicy', 'Corn', 'HalleCrtau', 5, 'Brett Yeast');
INSERT INTO Review VALUES (105, 'TheSpicy', '2023-11-30', 4, 'TheSpicy lives up to the name.');