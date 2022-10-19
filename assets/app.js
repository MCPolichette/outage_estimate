function updateByID(id, text) {
    document.getElementById(id).innerHTML = text
};
function DateToString(date) {
    let options = {
        // weekday: "short", //to display the full name of the day, you can use short to indicate an abbreviation of the day
        day: "numeric",
        month: "long", //to display the full name of the month
        year: "numeric"
    };
    var sDay = date.toLocaleDateString("en-US", options);
    return sDay
};
function validateFirstStep() {
    validationCheck(['outageStartDate', 'outageEndDate', 'merchantName', 'merchantId', 'networkCommission', 'affiliateCount',], 'firstSubmit', 'firstStepComplete')
};
function validateSecondStep() {
    let date_check = document.getElementById("chooseNewBaseLine").checked
    if (date_check) {
        baseline.date_start = document.getElementById("baselineStartDate").value
        baseline.date_end = document.getElementById("baselineEndDate").value
        baseline.date_start_display = new Date(baseline.date_start);
        baseline.date_start_display.setDate(baseline.date_start_display.getDate());
        baseline.date_end_display = new Date(baseline.date_end);
        baseline.date_end_display.setDate(baseline.date_end_display.getDate());
        console.log(baseline)
    }
    console.log(date_check)
    let commission_check = document.querySelector('input[name="AffCommission"]:checked');
    if (commission_check)
        switch (commission_check.value) {
            case 'universal_rate':
                validationCheck(['universal_affiliate_commission',], 'secondSubmit', 'SecondStepComplete')
                merchant.universal_commission = (Number(document.getElementById('universal_affiliate_commission').value) / 100)
                if (merchant.universal_commission) {
                    affiliates.forEach(affiliate => {
                        affiliate.commissionRate = merchant.universal_commission
                    })
                    console.log(affiliates);
                    console.log(merchant)
                };
                break
            case 'individual_rate':
                validationCheck(['affiliateFormFile'], 'secondSubmit', 'SecondStepComplete')
                break
        }
    else {
        console.log("NULL")
        alert('please set Affiliate Commission, or upload Affiliate Commission Rates')
    };
};
function validationCheck(arr, btn_id, new_button) {
    let arrCheck = 0
    arr.forEach(id => {
        if (document.getElementById(id).value) {
            successify(id)
        }
        else {
            document.getElementById(id).classList.add("alert-danger")
            arrCheck = 1;
            let btn = document.getElementById(new_button)
            btn.classList.add("disabled")
        };
    });
    console.log("Zero is good ==> " + arrCheck)
    if (arrCheck) { }
    else {
        let btn = document.getElementById(new_button)
        btn.classList.remove("disabled")
        btn.classList.remove("collapse")
        document.getElementById(btn_id).innerHTML = "Click to Update"
        //btn.classList.remove("disabled")
    };
};
function show_new_baseline() {
    document.getElementById('newBaseLineSelection').classList.remove("collapse")
    document.getElementById('chooseNewBaseLine').checked = true

};

function buildAllTables() {
    outage.estimated_total = (baseline.aov * outage.total_clicks);
    outage.estimated_sales = Number((outage.estimated_total * baseline.conversion_rate).toFixed(2));
    outage.discrepency = Number((outage.estimated_sales - outage.total_sales).toFixed(2))
    outage.adjusted_discrepency = Number((outage.average_sales_total - outage.discrepency).toFixed(2));
    console.log(merchant);
    console.log(outage);
    console.log(baseline);
    console.log(affiliates);
    buildBaseLineTable();
    buildMerchantTable();
    buildAffiliateTable();
};
function successify(id) {
    document.getElementById(id).classList.remove("alert-danger");
    document.getElementById(id).classList.add("alert-success")
};
function toUSD(dollarInt) {
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    dollarUSD = formatter.format(dollarInt);
    return dollarUSD
};
function fileCheck(myFile) {
    var file = myFile.files[0];
    var filename = file.name;
    filename.split('\-')
    console.log("FILENAME, ", filename);
    return filename;
};
function btn2() {
    if (baseline.salesTotal && secondButtonBoolean) {
        document.getElementById('secondSubmit').classList.remove("disabled")
    };
};
function readFile(input) {
    let fileName = fileCheck(input).replace(/ *\([^)]*\) */g, "");
    let id = input.id
    let file = input.files[0];
    let fileReader = new FileReader();
    let allLines = []
    fileReader.readAsText(file);
    fileReader.onload = function () {
        var text = fileReader.result;
        var allLines = text.split('\n')
        var topRow = allLines[0].split(',')
        let valuesRegExp = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\",]+)/g;
        let elements = [];
        console.log("TOPROW- " + topRow[1])
        if (topRow[1] == 'First Name') {//THIS IS AN AFFILIATE REPORT FOR Commission RATE
            if (affiliates == []) {
                alert("YOU MUST UPLOAD THE PERFORMANCE SUMMARY BY AFFILIATE FIRST")
            }
            else {
                secondButtonBoolean = true;
                console.log("TRUE!? " + secondButtonBoolean)
                for (i = 1; i < (allLines.length); i++) {
                    let thisRow = allLines[i].split(',');
                    affiliates.forEach(affiliate => {
                        if (affiliate.Affiliate_Id === thisRow[0]) {
                            let cr = (Number(Number(thisRow[8].replaceAll('\%', '')).toFixed(2)) / 100)
                            affiliate.commissionRate = cr
                        }
                        else {
                        }
                    })
                };
                btn2();
                console.log("Affiliates Updated?");
                console.log(affiliates);
                successify('affiliateFormFile');
                merchant.affDoc = fileName;
            } document.getElementById("affiliateReportFileName").innerHTML = fileName
        }
        else {
            console.log('unidentified report')
        }
    };
};

function build2columns(table, row, col1, col2) {
    var row = table.insertRow(row);
    var cell1 = row.insertCell(0).innerHTML = col1;
    var cell2 = row.insertCell(1).innerHTML = col2;
    cell1.width = '30%'
};
function buildMerchantTable() {
    var table = document.getElementById("merchantTable");
    table.innerHTML = ''
    build2columns(table, 0, "Merchant:", merchant.name);
    build2columns(table, 1, "Merchant ID :", merchant.id);
    build2columns(table, 2, "Network Commission:", (merchant.nc_display));
};
function buildOutageTable(o, t) {
    var table = document.getElementById("outageTable");
    table.innerHTML = '';
    table.style.textAlign = 'right'
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0).innerHTML = "Outage Dates :";
    var cell2 = row.insertCell(1).innerHTML = (DateToString(outage.date_start_display) + " to " + DateToString(outage.date_end_display));
    build2columns(table, 1, "Clicks :", outage.total_clicks);
    build2columns(table, 2, "Estimated Sales:", (toUSD(outage.estimated_sales)));
    build2columns(table, 3, "Tracked Sales :", (toUSD(outage.total_sales)));
    build2columns(table, 4, "Discrepency :", (toUSD(outage.discrepency)));
    build2columns(table, 5, "Adjusted Discrepency :", (toUSD(t)));
};
function buildBaseLineTable(data) {
    var table = document.getElementById("baselineTable");
    table.innerHTML = ''
    table.style.textAlign = 'right'
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0).innerHTML = "Baseline Dates :";
    var cell2 = row.insertCell(1).innerHTML = (DateToString(baseline.date_start_display) + " to " + DateToString(baseline.date_end_display));
    cell2.id = 'centeredDate'
    var row = table.insertRow(1);
    var cell3 = row.insertCell(0).innerHTML = "Sales :";
    var cell4 = row.insertCell(1).innerHTML = (toUSD(baseline.sales_amount));
    var row = table.insertRow(2);
    var cell5 = row.insertCell(0).innerHTML = "Number of Sales :";
    var cell6 = row.insertCell(1).innerHTML = (baseline.sales_count);
    var row = table.insertRow(3);
    var cell1 = row.insertCell(0).innerHTML = "Clickthroughs :";
    var cell2 = row.insertCell(1).innerHTML = (baseline.clicks);
    var row = table.insertRow(4);
    var cell3 = row.insertCell(0).innerHTML = "Conversion Rate :";
    var cell4 = row.insertCell(1).innerHTML = ((baseline.conversion_rate * 100).toFixed(2) + " %");
    var row = table.insertRow(5);
    var cell5 = row.insertCell(0).innerHTML = "AOV :";
    var cell6 = row.insertCell(1).innerHTML = (toUSD(baseline.aov));
};
function buildAffiliateTable() {
    var atable = document.getElementById("affTable");
    if (atable.innerHTML) { atable.innerHTML = '' };
    document.getElementById("secondSubmit").innerHTML = "Click to Update Table"
    document.getElementById('makePDF').classList.remove('collapse')
    document.getElementById('makeBatchSalesDoc').classList.remove('collapse')
    var table = document.getElementById('affTable');
    var tableHead = document.createElement('thead');
    var tr = document.createElement('tr');
    var arrheader = ['Affiliate ID', 'Affiliate Name', 'Click Throughs', 'Tracked Sales during the outage', 'Estimated Sales by AOV, and Conversion', 'Percentage based on Clicks', 'Estimated Sales by Click Percentage', 'Average of Two Sales Figures', 'Estimated Affiliate Commission', 'Estimated Network Commission'];
    affarr = affiliates.slice(0, (merchant.affiliate_count));
    var totals = {
        clicks: 0,
        estimatedSalesbyAOV: 0,
        estimatedSalesByClick: 0,
        avgOfTwo: 0,
        estimatedComm: 0,
        networkComm: 0
    };
    for (var k = 0; k < affarr.length; k++) {
        totals.clicks = (totals.clicks + (affarr[k].clicks))
    };
    console.log("TOTAL CLICKS + " + totals.clicks)
    for (var j = 0; j < arrheader.length; j++) {
        var th = document.createElement('th'); //column
        var text = document.createTextNode(arrheader[j]); //cell
        th.appendChild(text);
        tr.appendChild(th);
    };
    tableHead.classList.add('table-primary', 'vertical-align')
    tableHead.style.textAlign = 'center';
    table.appendChild(tableHead);
    tableHead.appendChild(tr)
    console.log(affarr)
    for (var i = 0; i < affarr.length; i++) {
        affarr[i].estimatedAOV = (baseline.conversion_rate * baseline.aov * affarr[i].clicks);
        if (affarr[i].commissionRate) { }
        else {
            console.log(i)
            affarr[i].commissionRate = .01
            console.log(affarr[i].Affiliate + " Does not have a commission rate")
        }
        let percentageBasedOnClicks = Number((affarr[i].clicks / totals.clicks).toFixed(4));
        let estimatedSalesBasedOnPercent = Number((percentageBasedOnClicks * outage.discrepency).toFixed(2));
        affarr[i].salesAverage = (affarr[i].estimatedAOV + estimatedSalesBasedOnPercent) / 2;
        let estimatedCommission = Number((affarr[i].salesAverage * affarr[i].commissionRate).toFixed(2))
        let estimatedNC = (affarr[i].salesAverage) * merchant.nc;
        if (document.getElementById("percentOfAffCom").checked) {
            estimatedNC = (estimatedCommission * merchant.nc)
        };
        // outage.avgTotal = (outage.avgTotal + affarr[i].salesAverage) //!? is this redudant with totals.avgOfTwo?
        totals.estimatedSalesbyAOV = totals.estimatedSalesbyAOV + affarr[i].estimatedAOV;
        totals.estimatedSalesByClick = totals.estimatedSalesByClick + estimatedSalesBasedOnPercent;
        totals.avgOfTwo = totals.avgOfTwo + affarr[i].salesAverage;
        totals.estimatedComm = totals.estimatedComm + estimatedCommission;
        totals.networkComm = totals.networkComm + estimatedNC;
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let td5 = document.createElement('td');
        let td6 = document.createElement('td');
        let td7 = document.createElement('td');
        let td8 = document.createElement('td');
        let td9 = document.createElement('td');
        let td10 = document.createElement('td');
        td2.style.textAlign = 'center';
        let text1 = document.createTextNode(affarr[i].Affiliate_Id);
        let text2 = document.createTextNode(affarr[i].Affiliate);
        let text3 = document.createTextNode(affarr[i].Click_Throughs);
        let text4 = document.createTextNode(affarr[i].Sales);
        let text5 = document.createTextNode(toUSD(affarr[i].estimatedAOV));
        let text6 = document.createTextNode((percentageBasedOnClicks * 100).toFixed(2) + "%");
        let text7 = document.createTextNode(toUSD(estimatedSalesBasedOnPercent));
        let text8 = document.createTextNode(toUSD(affarr[i].salesAverage));
        let text9 = document.createTextNode(toUSD(estimatedCommission));
        let text10 = document.createTextNode(toUSD(estimatedNC));
        td1.appendChild(text1);
        td2.appendChild(text2);
        td3.appendChild(text3);
        td4.appendChild(text4);
        td5.appendChild(text5);
        td6.appendChild(text6);
        td7.appendChild(text7);
        td8.appendChild(text8);
        td9.appendChild(text9);
        td10.appendChild(text10);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
        tr.appendChild(td8);
        tr.appendChild(td9);
        tr.appendChild(td10);
        table.appendChild(tr);
    };
    let footer = document.createElement('tfoot');
    let tf1 = document.createElement('tr');
    let c1 = document.createElement('td');
    let c2 = document.createElement('td');
    let c3 = document.createElement('td');
    let c4 = document.createElement('td');
    let c5 = document.createElement('td');
    let c6 = document.createElement('td');
    let c7 = document.createElement('td');
    let t1 = document.createTextNode('Totals from the top ' + merchant.affiliateCount + ' Affiliates');
    c1.scope = 'row';
    c1.colSpan = '2';
    c3.colSpan = '2';
    c4.colSpan = '2';
    footer.classList.add('table-secondary')
    let t2 = document.createTextNode(totals.clicks);
    let t3 = document.createTextNode(toUSD(totals.estimatedSalesbyAOV));
    let t4 = document.createTextNode(toUSD(totals.estimatedSalesByClick));
    let t5 = document.createTextNode(toUSD(totals.avgOfTwo));
    let t6 = document.createTextNode(toUSD(totals.estimatedComm));
    let t7 = document.createTextNode(toUSD(totals.networkComm));
    c1.appendChild(t1);
    c2.appendChild(t2);
    c3.appendChild(t3);
    c4.appendChild(t4);
    c5.appendChild(t5);
    c6.appendChild(t6);
    c7.appendChild(t7);
    tf1.appendChild(c1);
    tf1.appendChild(c2);
    tf1.appendChild(c3);
    tf1.appendChild(c4);
    tf1.appendChild(c5);
    tf1.appendChild(c6);
    tf1.appendChild(c7);
    footer.appendChild(tf1);
    table.appendChild(footer);
    console.log(outage);
    buildOutageTable(outage, totals.avgOfTwo);
    buildBaseLineTable(baseline);
}