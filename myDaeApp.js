export function hello(){
    window.alert("hello");
}


var contractSource= `
contract KwikJobsContract =
  
  record transactionRecord={
      hirersAddress    :     address,
      workersAddress   :     address,
      amountPaid       :     int,
      miliId           :     int
           }


  record state = {paymentsMade:map(int,transactionRecord),transactionRecordsLength:int}
  
  
  
  
  entrypoint init()={paymentsMade ={},transactionRecordsLength=0} 
  
  entrypoint getPayment(index:int):transactionRecord =
    switch(Map.lookup(index,state.paymentsMade))
      None => abort("There was no user with this index")
      Some(x) => x
   
    
  stateful entrypoint makePayment(miliId':int)=
    let pTrans={hirersAddress=Call.caller,workersAddress=Call.caller,amountPaid=1,miliId=miliId'}
    let index=getTransactionRecordsLength()+1
    put(state{paymentsMade[index]=pTrans,transactionRecordsLength=index})
    
  entrypoint getTransactionRecordsLength():int= 
    state.transactionRecordsLength
    
  stateful entrypoint handlePayment(index:int)=
    let pTracRec=getPayment(index)
    Chain.spend(pTracRec.workersAddress,Call.value)
    let updatedAmount=pTracRec.amountPaid+Call.value
    let updatedPTrac=state.paymentsMade{[index].amountPaid=updatedAmount}
    put(state{paymentsMade=updatedPTrac})
`;