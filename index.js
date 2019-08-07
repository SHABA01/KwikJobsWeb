var workersAddress;
var contractAddress;
var contractSource;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        $(".login-cover").hide();
        var paymentDialog = document.querySelector('#PaymentDialog');
        var dialog = document.querySelector('#loginDialog');
        /*
        if (! dialog.showModal) {
          dialogPolyfill.registerDialog(dialog);
        }
        */
        dialog.close();
        paymentDialog.showModal();

    } else {

        $(".login-cover").show();

        // No user is signed in.
        var dialog = document.querySelector('#loginDialog');
        //   if (! dialog.showModal) {
        //     dialogPolyfill.registerDialog(dialog);
        //   }
        dialog.showModal();

    }
});

/ * LOGIN PROCESS */

$("#loginBtn").click(
    function() {


        var email = $("#loginEmail").val();
        var password = $("#loginPassword").val();

        if (email != "" && password != "") {
            $("#loginProgress").show();
            $("#loginBtn").hide();

            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;

                $("#loginError").show().text(errorMessage);
                $("#loginProgress").hide();
                $("#loginBtn").show();
            });
        }
    }
);
$("#signOutBtn").click(
    function() {

        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }).catch(function(error) {
            // An error happened.
            alert(error.message);
        });

    }
);

$('#paymentButton').click(async function() {
    var workersPublicAddress = $('#workersPublicAddress').val();
    var amount = $('#amount').val();
    var workersId = $('#workersId').val();
    var timeMilli = $('#timeMilli').val();
    var paymentAmount = parseInt(amount);

    var addresString = parseInt(workersPublicAddress, 256);
    await contractCall('makePayment', [timeMilli, paymentAmount, workersPublicAddress], paymentAmount);
    // await contractCall('handlePayment',[])


    var amounts = parseInt(amount) + parseInt(amount);

    var paymentDialog = document.querySelector('#PaymentDialog');

    // paymentDialog.close();
    //   window.alert(workersPublicAddress+" "+amounts+" "+workersId+" "+timeMilli);
});
var client = null;
async function callStatic(func, args) {
    const contract = await client.getContractInstance(contractSource, { contractAddress });
    const calledGet = await contract.call(func, args, { callStatic: true }).catch(e => console.error(e));
    console.log('calledGet', calledGet);

    const decodeGet = await calledGet.decode().catch(e => console.error(e));
    return decodeGet;
}

async function contractCall(func, arg, value) {
    const contract = await client.getContractInstance(contractSource, { contractAddress });
    const calledGet = await contract.call(func, arg, { amount: value }).catch(e => console.error(e));
    console.log('calledGet', calledGet);
    return calledGet;
}
window.addEventListener('load', async() => {
    contractAddress = "ct_28SSYzkLBajsuU62KYFZoMSa9g1MVCmaKYU3Dzx8B87kredAZQ";
    contractSource = `
  contract KwikJobsContract =
  
   record transactionRecord={
       hirersAddress    :     address,
       workersAddress   :     address,
       amountPaid       :     int,
       miliId           :     string
            }
 
 
   record state = {paymentsMade:map(int,transactionRecord),transactionRecordsLength:int}
   
   
   
   
   entrypoint init()={paymentsMade ={},transactionRecordsLength=0} 
   
   entrypoint getPayment(index:int):transactionRecord =
     switch(Map.lookup(index,state.paymentsMade))
       None => abort("There was no user with this index")
       Some(x) => x
    
     
   stateful entrypoint makePayment(miliId':string,amount:int,workersAddress':address)=
     let pTrans={hirersAddress=Call.caller,workersAddress=workersAddress',amountPaid=amount,miliId=miliId'}
     let index=getTransactionRecordsLength()+1
     put(state{paymentsMade[index]=pTrans,transactionRecordsLength=index})
     
   entrypoint getTransactionRecordsLength():int= 
     state.transactionRecordsLength
     
   public stateful entrypoint handlePayment(index:int)=
     let pTracRec=getPayment(index)
     Chain.spend(pTracRec.workersAddress,pTracRec.amountPaid)
     let updatedAmount=pTracRec.amountPaid-pTracRec.amountPaid
     let updatedPTrac=state.paymentsMade{[index].amountPaid=updatedAmount}
     put(state{paymentsMade=updatedPTrac})
`;
    console.log("hi hacbocbobco");
    client = await Ae.Aepp();
    var paymentsLength = await callStatic('getTransactionRecordsLength', []);
    console.log("hi hacbocbobco");
    console.log('paymentsLength', paymentsLength);
    for (let i = 1; i <= paymentsLength; i++) {
        const transactionRecord = await callStatic('getPayment', [i]);
        console.log('Tranaction Record', transactionRecord);
        //  var  workersAddress=paymentTransaction.workersAddress;
        //   amountPaid=paymentTransaction.amountPaid;
        //   console.log(amountPaid+ "This is the amount paid");
        //   console.log(workersAddress,"This is the workers address");
        // //  $('#workersPublicAddress').val(workersAddress);
        //  $('#amount').val(amountPaid);

    }

});

function hexToString(tmp) {
    var arr = tmp.split(' '),
        str = '',
        i = 0,
        arr_len = arr.length,
        c;

    for (; i < arr_len; i += 1) {
        c = String.fromCharCode(h2d(arr[i]));
        str += c;
    }

    return str;
}