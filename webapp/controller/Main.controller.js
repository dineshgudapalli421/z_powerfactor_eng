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
        },

        onSearch: function () {
            debugger;
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
            //var oTable = this.getView().byId("tblPowerFactor");
            oModel.read("/", {
                filters: aFilter,
                success: function (response) {
                    debugger;
                    oBusyDialog.close();
                    //oJsonModel.setData(response.results);
                    oJsonModel.setData(response.results);
                    oView.byId("tblUsageInfo").setModel(oJsonModel, "EngModel");
                },
                error: (oError) => {
                    debugger;
                    oBusyDialog.close();
                    console.error("Error:", oError);
                }
            });

        }
    });
});