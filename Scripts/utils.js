
class FlightDetails {
    Carrier;
    FlightNumber;
    Origin;
    Destination;
    DepDate;
    DepTime;
    ArrivalDate;
    ArrivalTime;
    ClassofService;
}

function debug(valOfObj) {
    console.log(JSON.stringify(valOfObj));
}

function random_rgba() {
    var o = Math.floor, r = Math.random, s = (75);
    return 'rgba(' + (o((r() * s)) + 170) + ',' + (o((r() * s)) + 170) + ',' + (o((r() * s)) + 170) + ',' + r().toFixed(1) + ')';
}


function drawCards(OfferList) {
    body = "";
   
    OfferList.forEach(function (offer) {
        body += '<div class = "card-deck m-1 col-12">'
        offer.OfferDetails.forEach(function (OfferDetails) {
            let Currency = OfferDetails.Currency;
            let TotalPrice = OfferDetails.TotalPrice;
            let OfferColor = OfferDetails.OfferColor;
            let tierLevel = OfferDetails.tierLevel;
            let source = OfferDetails.OfferSource;
            let attributes = OfferDetails.Brandattributes;

            body += `<div class = "card" style = "background-color:${OfferColor}">`;
            body += `<div class = "card-topper card-img-top"> </div> 
                    <div class = "card-body"> <h2> ${Currency} ${TotalPrice} </h2> `;
            body += `<h5 class = "card-subtitle mb-2 text-muted"> ${tierLevel}</h5>
                        <div class="col-12"><h8> Source: ${source}</h8></div>`;

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
                body += `<div class="col-12"> <h7> <i class="fas fa-plane-departure"></i></h7><h4>${Carrier}${FlightNumber} RBD: ${ClassofService}</h4> </div> 
                        <div class="col-12"> <h6> ${Origin} ${DepDate} ${DepTime} </h6>
                            <div class="col-2 col-md-auto text-8 text-black-50 text-center trip-arrow">➝</div>
                            <h6> ${Destination} ${ArrivalDate} ${ArrivalTime}</h6> </div>`;
                body += `<div class ="row col-12">`;
                if (attributes != null) {
                    for (var i = 0; i < attributes.length - 1; i++) {
                        body += `<div class="ml-1"><img src="./Content/Images/${attributes[i].brandAttribute}.png" style="width:16px;height:16px;"></div>`
                    }
                }
                body += `</div>`;
                body += `<br />`;
            });

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
                        body += `<div class="col-12"><h7><i class="fas fa-plane-arrival"></i> </h7><h4> ${Carrier}${FlightNumber} RBD:${ClassofService} </h4></div> <div class="col-12"><h6> ${Origin}${DepDate} ${DepTime}
                                <div class="col-2 col-md-auto text-8 text-black-50 text-center trip-arrow">➝</div>
                                ${Destination} ${ArrivalDate} ${ArrivalTime} </div></h6>`;
                    }
                    body += `<div class="row">------------------</div>`;
                });
            }

            body += `</div></div>`;
        });
        body += `</div>`;
    });

    return body;
}


function getFlightCarrier(flightSegment, reference) {
    var details = "";
    var refOption = null;
    reference.forEach(function (refOptionLoop) {
        if (refOptionLoop["@type"] == "ReferenceListFlight") {
            refOption = refOptionLoop;
        }
    })

    flightSegment.forEach(function (segment) {
        refOption.Flight.forEach(function (refFlight) {
            if (refFlight.id == segment.Flight.FlightRef) {
                details = refFlight.carrier;
            }
        })
    })
    return details;
}

function detectfunctionandversion(jsonObj) {
    if (jsonObj != null) {
        if (jsonObj.CatalogOfferingsResponse != null && jsonObj.CatalogOfferingsResponse.CatalogOfferings != null) //Search v9
        {
            debug("Search v9");
            return SearchV9DisplayAllOffers(jsonObj);
        }
        else if (jsonObj.CatalogProductOfferingsResponse != null && jsonObj.CatalogProductOfferingsResponse.CatalogProductOfferings!= null && jsonObj.CatalogProductOfferingsResponse.CatalogProductOfferings.DefaultCurrency) // Fare Family Version 9
        {
            debug("FFS v9");
            return FareFamilyV9DisplayAllOffers(jsonObj);
        }
        else { //v11
            debug("Search+ v11");
            return SearchV11DisplayAllOffers(jsonObj);
        }
    }
}