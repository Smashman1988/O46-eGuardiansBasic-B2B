/* Shared generic item controller for main/category/Vue entries.
 * Compiled into those entries; the PDP uses its existing dedicated controller. */
O46Core.item = O46Core.item || function () {
    if (O46Core.installed.item) return;
(function () {
    eGuardians.item = new function () {
        this.variations = new function (){
      
            var attributeList;// = $('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
           
            //var itemVariations;// = $('[data-item-variation]').data('eg-variations');//$(attributeList).data('eg-variations'), pressedActiveParent;
            var variations = this;

            this.init = function(mainContainer){
                attributeList = $(mainContainer).find('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
                //itemVariations = $(mainContainer).data('eg-variations');
                var itemVariations = $(mainContainer).data('eg-variations');
                variations = this;
                $(attributeList).each(function(){
                    //var variationForObject = [];
                   // var _this = this;
                    var attributeId = $(this).data('eg-attributes');
                    var indexOfAttribute = 0;//DELETE NEED? $(this).data('eg-index');

                    $(this).find('[data-eg-value]').each(function(){
                        var attributesFormat = {'attributeId':attributeId,'attributeValueId':$(this).data('eg-value')};  
                     
                        if(typeof this.variation == "undefined"){
                             this.variation = [];
                        }
        
                        /* Set Variations Data Attribute with infos to Element */
                        $(this).data('variation',variations.findVariation(attributesFormat,indexOfAttribute,mainContainer));
                    });
                });
                /** Bind Events **/


                /*if($('.modal-cross').hasClass('show')){
                    $(mainContainer).on('touchend click','.modal-cross [data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute);
                }else{
                     
                }*/
                $(mainContainer).on('touchend click','[data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute); 
            };
            var selectAttribute = function(attributes, searchIndex){
                $(this).closest('.attribute-box').removeClass('errorVariationSelect');
                pressedActiveParent = $(this).parents('[data-eg-attributes]');
                //pressedActiveParent = $(this).parents('[data-item-variation]');
                $(this).parents('[data-eg-attributes]').find('[data-eg-value]').removeAttr('data-selected');
                $(this).attr('data-selected','');
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                variations.setVarition(this);
                
                /*
                
                console.log($(pressedActiveParent));
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                $(this).attr('data-selected','');
                variations.setVarition(this);*/
                //$(pressedActiveParent).hide();
            };         
            /**
             * 
             * @param {type} attributes
             * @param {type} searchIndex
             * @returns {unresolved}
             */
            this.findVariation = function(attributes, searchIndex,_this){
                var foundedVariation = null;
                var selectedVariation = [];
                var itemVariations = $(_this).data('eg-variations');
                $(itemVariations).each(function(key, valVariation){
                        foundedVariation = valVariation.attributes.filter(function (el) { 
                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); 
                        /*if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                        }
                        var reverseAttr = valVariation.attributes.reverse();
                        foundedVariation = reverseAttr.filter(function (el) { 

                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); */
                        
                        if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                            //return false; 
                        }
                    //})
                });
                return selectedVariation;
            };
            this.getVariation = function(attributes,_this){
           
                /*var selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                 Wenn keine Variante gefunden wurde dann drehe array und prüfe erneut 
                if(selectedVariation.length==0){
                    attributes = attributes.reverse();
                    selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                }*/
                var selectedVariation = null;
                var foundLength = 0;
                var hasLength = attributes.length;
                var itemVariations = $(_this).closest('[data-item-variation]').data('eg-variations');
                console.log(_this)
                $(itemVariations).each(function(key, variationVal){
                    foundLength = 0;
                    $(variationVal.attributes).each(function(key, attrVal){
                        $(attributes).each(function(key, selectAttrVal){
                            if(JSON.stringify(selectAttrVal) === JSON.stringify(attrVal)){
                                foundLength++;
                            }
                        })
                        
                    });
                    if(foundLength==hasLength){
                        selectedVariation = variationVal;
                        return true;
                    }
                    
                });
   
                return selectedVariation;
            };
            this.setVarition = function(_this){
                var attributesFormat = [];
                var activeAttributeBox = null;
                $itemElement = $(_this).parents('[data-item]');
                attributeList = $itemElement.find('[data-eg-attributes]');
                
               
                $(attributeList).each(function(){
                    
                    var selectedAttributeValue = 0; 

                    if($("option:selected", this).length>0){
                        /* if element is select box */
                        selectedAttributeValue = $("option:selected", this).val();
                    }else{
                        /* custom elements */
                        selectedAttributeValue = $(this).find('[data-selected]').data('eg-value');
                    }
                    if($(this).attr('data-eg-attributes')) {   
                        /* custom elements */
                        activeAttributeBox = $(this).data('eg-attributes'); 
                        
                    }else{
                       /* if element is select box */
                        activeAttributeBox = $(_this).parentsUntil(attributeList).data('eg-attribute'); 
                    }
                    attributesFormat.push({'attributeId':activeAttributeBox,'attributeValueId':parseInt(selectedAttributeValue)});                             
                });

                //checkVariation(attributesFormat);
                this.findInactiveAttributes(_this);

                var activeVariation = this.getVariation(attributesFormat,_this);
       
                if(activeVariation != null){
                    $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').tooltip('dispose');
                 
                    /* Get active VariationId and store to variation */
                    $(_this).parents('[data-item]').find('[data-item-variation]').data().activeVariationId = activeVariation.variationId;
                    $(_this).parents('[data-item]').attr('data-eg-active-variation',activeVariation.variationId);
                    /*$.get("/rest/io/variations/" + activeVariation[0].variationId+'?template='+encodeURI('Ceres::Item.SingleItem'), function(response) {
                        var responseData = JSON.parse(response).data;
                        console.log("data");
                        //console.log(getImages(responseData.documents[0].data.images));
                    });*/
                    var searchParams = {
                        template: encodeURI('Ceres::Item.SingleItem')
                    }
                    $('[data-eg-loading-attr]').addClass('isLoading');
                    eGuardians.apiservice.get('/rest/io/variations/' + activeVariation.variationId, searchParams, function(response){    
                      
                        var variationData = response.data.documents[0].data;
                        if(variationData.stock.net<7 && variationData.stock.net>0){
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn1"]+' '+variationData.stock.net+' '+messageServiceTranslations["stockWarn2"])
                        }else{
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn3"])
                        }                        
                        const pricenumber = variationData.prices.default.data.unitPrice;
                        const uvpnumber = variationData.prices.rrp.data.unitPrice;
                        $itemElement.find('[data-eg-item-price]').html(new Intl.NumberFormat("de-DE").format(pricenumber));
                        if(variationData.prices.rrp != null){
                            $itemElement.find('[data-eg-item-rrp]').html(new Intl.NumberFormat("de-DE").format(uvpnumber));
                            var rrppercent = (1 - variationData.prices.default.data.unitPrice / variationData.prices.rrp.data.unitPrice ) * -100;
                            $itemElement.find('[data-eg-item-rrp-percent]').html(Math.round(rrppercent).toFixed(0));
                            var rrpspar = (variationData.prices.default.data.unitPrice - variationData.prices.rrp.data.unitPrice );
                            $itemElement.find('[data-eg-item-rrp-spar]').html(new Intl.NumberFormat("de-DE").format(rrpspar));
                        }
                        
                        
                        
                        $itemElement.find('[data-eg-item-nr]').html(variationData.variation.number);
                        
                        $itemElement.find('[data-eg-item-availbility]').html(variationData.variation.availability.names.name).attr('data-availibilityid',variationData.variation.availability.id);
                        if(variationData.variation.availability.id>=7){
                            
                            $itemElement.find('[data-item-tobasket]').attr('title','Der Artikel ist momentan leider vergriffen');
                            $itemElement.find('[data-item-tobasket]').tooltip();
                            $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                        }else{
                           $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled')
                        }
                        var event = document.createEvent("Event");
                        event.initEvent("submit", false, true); 
                        document.dispatchEvent(event,response);
                        //document.dispatchEvent(new CustomEvent("variationChanged",response));
                        $('[data-eg-loading-attr]').removeClass('isLoading');
                        
                        if(variationData.prices.graduatedPrices.length>0){
                            $('.table-gruaded-head').html('');
                            $('.table-gruaded-content').html('');
                            $(variationData.prices.graduatedPrices.reverse()).each(function(i,gruadedData){
                                
                                if(gruadedData.minimumOrderQuantity>1){
                                    $('.table-gruaded-head').append('<div class="table-cell table-head">ab <span>'+gruadedData.minimumOrderQuantity+'</span></div>');
                                    $('.table-gruaded-content').append('<div class="table-cell table-content"> <span class="bold">'+gruadedData.price.formatted+'</span></div>');
                                    /*$('.table-head[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.minimumOrderQuantity);
                                    $('.table-content[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.price.formatted);*/
                                }
                            })
                        }
                        
                    });
                }else{
                    $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').attr('title','Diese Variante ist leider nicht mehr verfügbar.');
                    //$('[data-item-tobasket]').attr('data-toggle','tooltip');
                    $itemElement.find('[data-item-tobasket]').tooltip();
                }
            };
            this.findInactiveAttributes = function(activeElement){
                /* 
                 * Wählt man ein Attribute finde andere Attribute die nicht zu dem Attribut gehören 
                 * pressedActiveParent ist das Element was gerade angeklickt wurde
                 */
                $itemElement = $(activeElement).parents('[data-item]');
                $itemElement.find('[data-eg-value]').removeClass('disabled');
                var selectedAttributeData = $("[data-selected]", pressedActiveParent).data();
                $itemElement.find('[data-eg-value]').each(function(){
                   
                    if(!$(this).parents('[data-eg-attributes]').is(pressedActiveParent)){
                        var foundaAttribute = false;
                        if($(this).data().variation!=null){
                            $($(this).data().variation).each(function(varKey,varVal){
                                 $(varVal.attributes).each(function(key, attributeValue){
                                    if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                        foundaAttribute = true;
                                    }
                                });
                                if(!foundaAttribute){
                                    $(varVal.attributes.reverse()).each(function(key, attributeValue){
                                        if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                            foundaAttribute = true;
                                        }
                                    });
                                }
                            });
                        }
                        if(!foundaAttribute){
                            $(this).addClass('disabled');
                        }
                    }
                });
            };
        };
        this.quantity = {
            change: function(images){
                return images.variation.length>0 ? images.variation : images.all;
            }
        };
    };
})(eGuardians);
    O46Core.installed.item = true;
};
