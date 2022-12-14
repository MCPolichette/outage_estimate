// VALIDATION FUNCTIONS
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