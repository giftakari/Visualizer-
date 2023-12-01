

class Searchv9Offers {
    OfferId;
    OfferDetails;
}

class Searchv9resultDetails {
    Type;
    TotalPrice;
    BrandRef;
    tierLevel;
    flights;
    Currency;
    Carrier;
}

function SearchV9getDefaultCurrency(response) {    
    return response.CatalogOfferingsResponse.CatalogOfferings.DefaultCurrency.code;
}

function FareFamilyV9getDefaultCurrency(response) {
    return response.CatalogProductOfferingsResponse.CatalogProductOfferings.DefaultCurrency.code;
}

function SearchV9DisplayAllOffers(jsonData) {

    currency = SearchV9getDefaultCurrency(jsonData);
    var id = 0;

    var OfferList = new Array();

    if (jsonData != null && jsonData.CatalogOfferingsResponse.CatalogOfferings.CatalogOffering != null) {
        jsonData.CatalogOfferingsResponse.CatalogOfferings.CatalogOffering.forEach(function (offer) {
            offerPrice = offer.Price.TotalPrice;
            offer.ProductOptions.forEach(function (item) {
                var color = random_rgba();
                var offer = new Searchv9Offers();

                offer.OfferId = id;
                var OfferDetails = new Array();
                item.Product.forEach(function (poffer) {                  

                    var details = SearchV9getSearchDetailsv9(poffer, jsonData.CatalogOfferingsResponse.ReferenceList);
                    details.Currency = currency;
                    details.OfferColor = color;
                    details.TotalPrice = offerPrice;
                    details.OfferSource = " - "; // TODO: find offer source

                    OfferDetails.push(details);
                })

                offer.OfferDetails = OfferDetails;
                OfferList.push(offer);
                id = id + 1;
            })
        })
    }
    body = drawPricePointCards(OfferList);
    return body;
}

function SearchV9getSearchDetailsv9(ProductOffer, Reference) {
    var ProductDetails = new Searchv9resultDetails();
    ProductDetails.Type = ProductOffer["@type"];
    ProductDetails.flights = SearchV9getSearchFlightDetailsv9(ProductOffer.FlightSegment, Reference);

    let i = 0;
    ProductDetails.flights.forEach(function (segment) {      
        segment.ClassofService = ProductOffer.PassengerFlight[0].FlightProduct[0].classOfService;
        ProductDetails.tierLevel = ProductOffer.PassengerFlight[0].FlightProduct[0].cabin;
        i = i + 1;
    });

    return ProductDetails;
}

function SearchV9getSearchFlightDetailsv9(Segments, Reference) {
    var segdetails = new Array();
    Segments.forEach(function (flightSegment) {
        segdetails.push(SearchV9getSegmentDetails(flightSegment.Flight.FlightRef, Reference));
    })

    return segdetails;
}

function SearchV9getSegmentDetails(segmentRef, Reference) {

    Reference.forEach(function (refOptionLoop) {
        if (refOptionLoop["@type"] == "ReferenceListFlight") {
            refOption = refOptionLoop;
        }
    })

    var flightDetails = new FlightDetails();
    refOption.Flight.forEach(function (loopSegment) {
        if (loopSegment.id == segmentRef) {

            flightDetails.Carrier = loopSegment.carrier;
            flightDetails.FlightNumber = loopSegment.number;
            flightDetails.Origin = loopSegment.Departure.location;
            flightDetails.Destination = loopSegment.Arrival.location;
            flightDetails.DepDate = loopSegment.Departure.date;
            flightDetails.DepTime = loopSegment.Departure.time;
            flightDetails.ArrivalDate = loopSegment.Arrival.date;
            flightDetails.ArrivalTime = loopSegment.Arrival.time;

        }
    })
    return flightDetails;
}

function FareFamilyV9DisplayAllOffers(jsonData) {   

    var id = 0;
    var currency = FareFamilyV9getDefaultCurrency(jsonData);
    var OfferList = new Array();

    if (jsonData != null && jsonData.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering != null) {
        jsonData.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.forEach(function (loffer) {


            if (loffer.sequence == 1) {


                var offer;

                loffer.ProductBrandOptions.forEach(function (item) {
                    var color = random_rgba();
                    offer = new FFOffers();

                    offer.OfferId = id;
                    var OfferDetails = new Array();
                    item.ProductBrandOffering.forEach(function (poffer) {
                        //console.log(poffer.Product[0].productRef);
                        var details = getBrandDetails(poffer, jsonData.CatalogProductOfferingsResponse.ReferenceList);
                        details.Currency = currency;
                        //details.OfferSource = "GDS";
                        if (details.TotalPrice == null) {
                            details.TotalPrice = poffer.Price.TotalPrice;
                            //details.Currency = poffer.Price.CurrencyCode.value;
                            //details.OfferSource = "NDC";
                        }
                        //find all return flights
                        details.returnflights = new Array();
                        getAllReturnFlights(details.returnflights, poffer.CombinabilityCode, jsonData.CatalogProductOfferingsResponse);
                        details.OfferColor = color;
                        details.Sequence = loffer.sequence;
                        //drawcards(details, color, id);
                        OfferDetails.push(details);
                    })

                    offer.OfferDetails = OfferDetails;
                    OfferList.push(offer);

                    id = id + 1;
                })
            }
        })
    }

    body = drawCards(OfferList);
    return body;
}


function drawPricePointCards(PricePoints) {
    body = "";

    PricePoints.forEach(function (offer) {
        //body += '<div class = "card-deck m-1 col-12">'
        offer.OfferDetails.forEach(function (OfferDetails) {
            let Currency = OfferDetails.Currency;
            let TotalPrice = OfferDetails.TotalPrice;
            let OfferColor = OfferDetails.OfferColor;
            let tierLevel = OfferDetails.tierLevel;
            let source = OfferDetails.OfferSource;
            body += `<div class = "card col-12 mb-1" style = "background-color:${OfferColor}">`;
            body += `<div class = "card-topper card-img-top "> </div> <div class = "card-body">  <h2> ${Currency} ${TotalPrice} </h2>`;
          
            body += `<h5 class = "card-subtitle mb-2 text-muted"> ${tierLevel}</h5><h6><ul style="list-style-type:none;padding:0px;margin:0px;"> Source:${source}`;

            OfferDetails.flights.forEach(function (flight) {
                
                let Carrier = flight.Carrier;
                let FlightNumber = flight.FlightNumber;
                let Origin = flight.Origin;
                let DepDate = flight.DepDate;
                let DepTime = flight.DepTime;
                let Destination = flight.Destination;
                let ArrivalDate = flight.ArrivalDate;
                let ArrivalTime = flight.ArrivalTime;
                let ClassofService = flight.ClassofService;
                body += `<li style="list-style:none"> <i class="fas fa-plane-departure"></i> <img src="https://goprivate.wspan.com/sharedservices/images/airlineimages/logoAir${Carrier}.gif"> ${Carrier}${FlightNumber} ${Origin} ${DepDate}${DepTime} -> ${Destination} ${ArrivalDate} ${ArrivalTime} RBD:${ClassofService} </li>`;

            });

            body += `<br\>`;
            if (OfferDetails.returnflights != null) {
                OfferDetails.returnflights.forEach(function (rflight) {
                    //console.log(rflight);
                    for (let index = 0; index < rflight.length; index++) {
                        const segment = rflight[index];
                        let Carrier = segment.Carrier;
                        let FlightNumber = segment.FlightNumber;
                        let Origin = segment.Origin;
                        let DepDate = segment.DepDate;
                        let DepTime = segment.DepTime;
                        let Destination = segment.Destination;
                        let ArrivalDate = segment.ArrivalDate;
                        let ArrivalTime = segment.ArrivalTime;
                        let ClassofService = segment.ClassofService;
                        body += `<li style="list-style:none"><i class="fas fa-plane-arrival"></i> <img src="https://goprivate.wspan.com/sharedservices/images/airlineimages/logoAir${Carrier}.gif"> ${Carrier}${FlightNumber} ${Origin}${DepDate} ${DepTime} -> ${Destination} ${ArrivalDate} ${ArrivalTime} RBD:${ClassofService}</li>`;
                    }
                    body += `----------------<br\>`;
                });
            }

            body += `</ul> </h6>  </div> </div>`;
        });
       // body += ` </div>`;
    });

    return body;
}