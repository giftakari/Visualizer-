
class FFOffers {
    OfferId;
    OfferDetails;
}

class resultDetails {
    Type;
    TotalPrice;
    BrandRef;
    tierLevel;
    flights;
    returnflights;
    Currency;
    Carrier;
    OfferColor;
    Sequence;
    CombinabilityCode;
    OfferSource;
    Brandattributes;
}

class BrandAttributes {
    brandAttribute;
}

function getBrandDetails(ProductOffer, Reference) {
    var ProductDetails = new resultDetails();
    ProductDetails.Type = ProductOffer["@type"];
    if (ProductOffer.BestCombinablePrice != null) {
        ProductDetails.TotalPrice = ProductOffer.BestCombinablePrice.TotalPrice;
        ProductDetails.Currency = ProductOffer.BestCombinablePrice.CurrencyCode.value;
        ProductDetails.OfferSource = "GDS";
    }
    else {
        if (ProductOffer.Price.CurrencyCode != null) {
            ProductDetails.Currency = ProductOffer.Price.CurrencyCode.value;
            ProductDetails.OfferSource = "NDC";
        }
        
        ProductDetails.TotalPrice = ProductOffer.Price.TotalPrice;
        
    }
	
    if (ProductDetails != null) {
        if (ProductOffer.Brand != null) {           
            ProductDetails.BrandRef = ProductOffer.Brand.BrandRef;
            ProductDetails.tierLevel = getBrandDetailsAsString(ProductOffer.Brand.BrandRef, Reference);
            ProductDetails.Brandattributes = getBrandAttributes(ProductOffer.Brand.BrandRef, Reference);
        }
        ProductDetails.flights = getProductsDetails(ProductOffer.Product, Reference);
        ProductDetails.Carrier = getCarrierProductsDetailsAsString(ProductOffer.Product, Reference);

        return ProductDetails;
    }
}

function getBrandAttributes(brandRef, reference) {
    //var attributes = new BrandAttributes();
    var brandAttributes = new Array();
    reference.forEach(function (refOption) {
        if (refOption["@type"] == "ReferenceListBrand") {

            if (refOption.Brand != null)
                refOption.Brand.forEach(function (brand) {
                    if (brand.id == brandRef) {
                        if (brand.BrandAttribute != null)
                        brand.BrandAttribute.forEach(function (eachBrandAttribute) {
                            var brandAttributeObj = new BrandAttributes();
                            if (eachBrandAttribute.inclusion == "Not Offered") {
                                brandAttributeObj.brandAttribute = eachBrandAttribute.classification + "NotOffered";
                            } else {
                                brandAttributeObj.brandAttribute = eachBrandAttribute.classification + eachBrandAttribute.inclusion;
                            }
                            brandAttributes.push(brandAttributeObj);
                        })
                    }
                })
        }
    })
    return brandAttributes;
}

function getBrandDetailsAsString(brandRef, reference) {
    var BrandDetails = "";

    reference.forEach(function (refOption) {
        if (refOption["@type"] == "ReferenceListBrand") {

            if (refOption.Brand != null)
                refOption.Brand.forEach(function (brand) {
                    if (brand.id == brandRef) {
                        BrandDetails = brand.name + " Tier " + brand.tier;
                    }
                })
        }
    })

    return BrandDetails;
}

function getCarrierProductsDetailsAsString(products, reference) {
    var carrier = "";
    var refOption = null;
    reference.forEach(function (refOptionLoop) {
        if (refOptionLoop["@type"] == "ReferenceListProduct") {
            refOption = refOptionLoop;
        }
    })

    if (refOption != null) {
        refOption.Product.forEach(function (refProduct) {
            products.forEach(function (SearchProduct) {
                if (refProduct.id == SearchProduct.productRef) {
                    carrier = getFlightCarrier(refProduct.FlightSegment, reference);
                }
            })
        })
    }

    return carrier;
}

function getProductsDetails(products, reference) {

    var details;
    var refOption = null;
    reference.forEach(function (refOptionLoop) {
        if (refOptionLoop["@type"] == "ReferenceListProduct") {
            refOption = refOptionLoop;
        }
    })


    if (refOption != null) {
        refOption.Product.forEach(function (refProduct) {
            products.forEach(function (SearchProduct) {
                if (refProduct.id == SearchProduct.productRef) {
                    details = getFlightDetails(refProduct, reference);
                }
            })
        })
    }
  
    return details;
}

function getFlightDetails(refProduct, reference) {
    var flights = new Array();
    var refOption = null;
    flightSegment = refProduct.FlightSegment;
  
    reference.forEach(function (refOptionLoop) {
        if (refOptionLoop["@type"] == "ReferenceListFlight") {
            refOption = refOptionLoop;
        }
    })


    flightSegment.forEach(function (segment) {
        refOption.Flight.forEach(function (refFlight) {
            if (refFlight.id == segment.Flight.FlightRef) {
                l = segment.sequence;
                var flight = new FlightDetails();
                flight.Carrier = refFlight.carrier;
                flight.FlightNumber = refFlight.number;
                flight.Origin = refFlight.Departure.location;
                flight.DepDate = refFlight.Departure.date.substring(5, refFlight.Departure.date.length);
                flight.DepTime = refFlight.Departure.time.substring(0, refFlight.Departure.time.length - 3);
                flight.Destination = refFlight.Arrival.location;
                flight.ArrivalDate = refFlight.Arrival.date.substring(5, refFlight.Arrival.date.length);
                flight.ArrivalTime = refFlight.Arrival.time.substring(0, refFlight.Arrival.time.length - 3);
                flight.ClassofService = getFlightProductDetails(refProduct, l);
                flights.push(flight);
            }
        })
    })
 
    return flights;
}

function getAllReturnFlights(returnflights, combinabilitycode, root) {
    listofOffers = root.CatalogProductOfferings.CatalogProductOffering;
    listofOffers.forEach(function (lofferReturn) {
        if (lofferReturn.sequence != 1) {
            lofferReturn.ProductBrandOptions.forEach(function (item) {
                item.ProductBrandOffering.forEach(function (poffer) {
                    if (poffer.CombinabilityCode[0] == combinabilitycode) {

                        var flight = getProductsDetails(poffer.Product, root.ReferenceList);
                        
                        returnflights.push(flight);
                    }
                })
            })
        }
    })

}

function getFlightProductDetails(refProduct, l) {
    var details = "";
    for (i = 0; i < refProduct.PassengerFlight.length; i++) {
        for (j = 0; j < refProduct.PassengerFlight[i].FlightProduct.length; j++) {
            for (k = 0; k < refProduct.PassengerFlight[i].FlightProduct[j].segmentSequence.length; k++)
                if (refProduct.PassengerFlight[i].FlightProduct[j].segmentSequence[k] == l)
                    details += refProduct.PassengerFlight[i].FlightProduct[j].classOfService;
        }
    }
   
    return details;
}

function SearchV11DisplayAllOffers(jsonData) {


    var id = 0;

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
                        
                        if (details.TotalPrice == null) {
                            details.TotalPrice = poffer.Price.TotalPrice;
                            details.Currency = poffer.Price.CurrencyCode.value;
                            details.OfferSource = "NDC";
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
    
