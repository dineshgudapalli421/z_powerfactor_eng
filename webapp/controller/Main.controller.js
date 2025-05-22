sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "sap/ui/core/format/DateFormat"
], (Controller, ODataModel, Filter, FilterOperator, JSONModel, MessageBox, DateFormat) => {
    "use strict";

    return Controller.extend("com.sap.lh.mr.zpowerfactoreng.controller.Main", {
        onInit() {
            const oView = this.getView();
            oView.setModel(new JSONModel({
                rowMode: "Fixed"
            }), "ui");
            const oLabel = this.getView().byId("idDateReport");
            const today = new Date();
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                style: "long"
            });
            const formattedDate = oDateFormat.format(today);
            oLabel.setText(formattedDate);
        },

        onSearch: function () {
            const oView = this.getView();
            var aFilter = [];
            var idEquipment = this.getView().byId("idEquipment").getValue();
            var idDevLocation = this.getView().byId("idDevLocation").getValue();
            if (idEquipment === "" && idDevLocation === "") {
                return MessageBox.error("Either Equipment or Device Location is mandatory...");
            }
            if (idEquipment !== "") {
                aFilter.push(new Filter("Equipment", FilterOperator.EQ, idEquipment));
            }
            if (idDevLocation !== "") {
                aFilter.push(new Filter("DeviceLocation", FilterOperator.EQ, idDevLocation));
            }
            var oDateRangeSelection = this.getView().byId("billingPeriodRange");
            var oStartDate = oDateRangeSelection.getDateValue();  // Start Date
            var oEndDate = oDateRangeSelection.getSecondDateValue();  // End Date
            if (oStartDate && oEndDate) {
                var startMonth = (oStartDate.getMonth() + 1).toString().padStart(2, '0');
                var startYear = oStartDate.getFullYear().toString();

                var endMonth = (oEndDate.getMonth() + 1).toString().padStart(2, '0');
                var endYear = oEndDate.getFullYear().toString();
            }
            else {
                return MessageBox.error("Period is mandatory...");
            }
            aFilter.push(new Filter("BillingPeriodMonth", FilterOperator.BT, startMonth, endMonth));
            aFilter.push(new Filter("BillingPeriodYear", FilterOperator.BT, startYear, endYear));

            var oModel = this.getOwnerComponent().getModel();
            var oJsonModel = new sap.ui.model.json.JSONModel();
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading Data",
                text: "Please wait..."
            });
            oBusyDialog.open();
            oModel.read("/PowerFactorSet", {
                filters: aFilter,
                success: function (response) {
                    oBusyDialog.close();
                    var oModelForm = new sap.ui.model.json.JSONModel(response.results[0]);

                    if (response.results.length > 0) {
                        oJsonModel.setData(response.results);
                        oView.byId("idCustomInfoForm").setModel(oModelForm);
                        oView.byId("tblUsageInfo").setModel(oJsonModel, "EngModel");
                        if (response.results[0].Message !== "") {
                            return MessageBox.error(response.results[0].Message);
                        }
                    }
                    else if (response.results.length === 0) {
                        oJsonModel.setData(response.results);
                        oView.byId("idCustomInfoForm").setModel(oModelForm);
                        oView.byId("tblUsageInfo").setModel(oJsonModel, "EngModel");
                        return MessageBox.error("There are no records..");
                    }

                },
                error: (oError) => {
                    oBusyDialog.close();
                    console.error("Error:", oError);
                }
            });

        }
    });
});