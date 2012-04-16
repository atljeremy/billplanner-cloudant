###
Deliverable 2
Author: Jeremy Fox
Created For: ASD Online
main.coffee (main.js)
###

###
Variables
###
@dataViewState        = false #false = bills (in localStorage) not visible. true = bills visible
@hasDataBeenDisplayed = false #Keeps track of whether or not localStorage has been display, if so, there is no reason to re-query localStorage, just show the previously viewed data.
@invalidateData       = false #set this to true when we need to force the app to re-query localStorage for new data.
@keyToEdit            = 0 #The key of the item in localStorage we want to edit
@cloudantURL          = "https://onglandistanyboubtaindeg:7kD3juiBXaEP82dEXBmiGQkX@atljeremy.cloudant.com/billplannerdata/"
billAccounts          = [
  "Please Select An Account",
  "Bank of America - Checking",
  "Bank of America - Savings",
  "Bank of America - Credit Card",
  "Wells Fargo - Checking",
  "Wells Fargo - Savings",
  "Wells Fargo - Credit Card"
]
@detailsKey           = ""   # Key used to retreive bill details on details.html
@detailsJson          = null # Json used to show bill on detials.html

###**********************************************************
State Control Methods
**********************************************************###
setViewState = (state) =>
  @dataViewState = state

getViewState = =>
  return @dataViewState
  
setDataDisplayed = (val) =>
  @hasDataBeenDisplayed = val

getDataDisplayed = =>
  return @hasDataBeenDisplayed
  
setInvalidated = (val) =>
  @invalidateData = val

getInvalidated = =>
  return @invalidateData
  
destroyDataSet = ->
  $("#items").empty()
  
destroyDetailsDataSet = ->
  $("#itemDetails").empty()
  
###**********************************************************
Getter and Setter for key to edit
**********************************************************###
@getKeyToEdit = =>
  return @keyToEdit
  
@setKeyToEdit = (key) =>
  @keyToEdit = key
  
###**********************************************************
Getter and Setter for details key
**********************************************************###
setDetailsKey = (key) =>
  @detailsKey = key
  
getDetailsKey = =>
  return @detailsKey

###**********************************************************
Getter and Setter for details json
**********************************************************###
setDetailsJson = (json) =>
  @detailsJson = json
  
getDetailsJson = =>
  return @detailsJson

###**********************************************************
Main Metheds
**********************************************************###
@storeData = =>
  newDate = new Date()

  if @getKeyToEdit() == 0 or @getKeyToEdit() == ""
    itemId = newDate.getTime()
  else
    itemId = @getKeyToEdit()

  item = {}
  item.name     = ["Name:", $("#name").val()]
  item.payto    = ["Pay To:", $("#payTo").val()]
  item.amount   = ["Amount:", $("#payAmount").val()]
  item.account  = ["From Account:", $("#payFrom").val()]
  item.payon    = ["Pay On:", $("#payOn").val()]
  item.notes    = ["Notes:", $("#notes").val()]
  item.remember = ["Remember This Payment:", getFavValue()]

  try
    localStorage.setItem itemId, JSON.stringify(item)
    setInvalidated(true)
    alert("Bill Added!")
    @setKeyToEdit(0)
    $("legend").html("<h2>Create a New Bill</h2>")
    @displayData()
    return
  catch e
    alert e
  
# $(window).scroll ->
#   if $(window).scrollTop() >= $(document).height() - $(window).height() - 100
#     $("div#loadmoreajaxloader").show()
#     $.ajax
#       type: "POST"
#       url: "php/load_bills.php"
#       success: (json) ->
#         if getViewState()
#           if json          
#             storeRemoteJsonData(json)
#           else
#             $("div#loadmoreajaxloader").hide()
#         else
#           $("div#loadmoreajaxloader").hide()
# 
# storeRemoteJsonData = (json) =>
#   _.each(_.keys(json), (key) ->
#     billIndexKey = key
#     _.each(_.keys(json[key]), (key) ->
#       item = json[billIndexKey]
#       billObject = item[key]
#       
#       try
#         localStorage.setItem key, JSON.stringify(billObject)
#         true
#       catch e
#         alert e
#     )
#   )
#   
#   setInvalidated(true)
#   $("div#loadmoreajaxloader").hide()
#   getData()
      
storeJsonData = () =>
  _.each(_.keys(@json), (key) ->
    item = @json[key]

    try
      localStorage.setItem key, JSON.stringify(item)
      return
    catch e
      alert e
  )
  setInvalidated(true)
  getData()

getData = ->
  $.ajax
    url: "/billplannerdata/_all_docs?include_docs=true"
    dataType: "json"
    success: (data) ->
      if _.size(data.rows) > 0
        qryBills(data)
      else
        alert "Nothing to show!"
        #storeJsonData()
    error: (error) ->
      alert "ERROR: " + error.statusText

getBill = (key) ->
  $.ajax
    url: "/billplannerdata/#{key}"
    dataType: "json"
    success: (data) ->
      if data._id is key
        setDetailsJson(data)
        setupBillDetails(data._id, data)
      else
        alert "ERROR 001: This bill could not be found."
    error: (error) ->
      alert "ERROR 002: " + error.statusText
      
setupBills = (json) ->
  billsList = []

  _.each(json.rows, (value, key) ->
    billObj = value.doc
    billObj.key = value.key
    billsList.push billObj
  )

  callbackFunc = (a, b) ->
    if a.payon[1] is b.payon[1]
      return 0 if a.payon[1] is b.payon[1]
      return (if (a.payon[1] < b.payon[1]) then -1 else 1)
    (if (a.payon[1] < b.payon[1]) then -1 else 1)
  
  if _.size(billsList) > 1
    billsList.sort callbackFunc
  else
    billsList

qryBills = (json) ->
  i = 1
  _.each(setupBills(json), (bill) ->

    key = bill.key
    
    makeListItem = $("<li>")
    makeListItem.attr "id", "li-key-"+key
    
    makeThumbIcon = $("<img>")
    makeThumbIcon.attr "class", "listThumbIcons"
    
    OPERATOR = ///
    ((Checking)|(Savings)|(Credit\sCard))+
    ///g

    account = bill.account[1]
    accountMatch = account.match(OPERATOR)
    switch accountMatch[0]
      when "Checking" then makeThumbIcon.attr "src", "i/checking_thumb.png"
      when "Savings" then makeThumbIcon.attr "src", "i/savings_thumb.png"
      when "Credit Card" then makeThumbIcon.attr "src", "i/credit_thumb.png"
      else makeThumbIcon.attr "src", "i/checking_thumb.png"
    
    makeArrowIcon = $("<img>")
    makeArrowIcon.attr "src", "i/arrow.png"
    makeArrowIcon.attr "class", "listArrowIcons"
    
    if(_.size(json.rows) == i)
      makeListItem.attr "class", "lastBill"
    else
      makeListItem.attr "class", "bill"
    
    makeLink = $("<a>")
    makeLink.attr "href", "#"
    makeListItem.append makeLink
    makeListItem.append makeThumbIcon
    makeListItem.append makeArrowIcon

    $("#items").append makeListItem
    
    $("#li-key-"+key).click("click", (e) ->
      stopEvent(e)
      $(this).removeClass("bill").addClass("billClicked")
      setDetailsKey(key)
      getBill(key)
      return false
    )
    
    payTo = bill.payto[1]
    if payTo.length >= 20
      payTo = payTo.substr(0, 20) + "…"
      
    payAmount = "$" + bill.amount[1]
    payDate = "(" + bill.payon[1] + ")"

    makeLink.html payTo + " " + payAmount + " " + payDate
    
    i++
  )  

editItem = =>
  bill = getDetailsJson()
  key = bill._id
  
  @setKeyToEdit(key)
  
  $("legend").html("<h2>Your Editing a Bill - <a href=\"#\" id=\"cancelEdit\" data-ajax=\"false\" >Cancel</a></h2>")
  
  $("#cancelEdit").click("click", (e) ->
    $.mobile.changePage( 'additem.html',
      reloadPage: true,
      allowSamePageTranstion: true,
      transition: 'slide'
    )
  )
  
  $('#name').val bill.name[1]
  $('#payTo').val bill.payto[1]
  $('#payAmount').val bill.amount[1]
  
  $('#payFrom').val bill.account[1]
  $('#payOn').val bill.payon[1]
  $('#notes').val bill.notes[1]
  _rev = $('<input>').attr('id', '_rev').attr('name', '_rev').attr('type', 'hidden').val(bill._rev)
  _id = $('<input>').attr('id', '_id').attr('name', '_id').attr('type', 'hidden').val(bill._id)
  $('#billForm').append _rev
  $('#billForm').append _id
  radios = $("input[type='radio']")
  for radio in radios
    if radio.value == "Yes" and bill.remember[1] == "Yes"
      $(radio).attr "checked", "checked"
      $("#labelNo").attr "class", "ui-btn ui-corner-right ui-controlgroup-last ui-radio-off ui-btn-up-c"
      $("#labelYes").attr "class", "ui-btn ui-corner-left ui-btn-up-c ui-radio-on ui-btn-active"
    else if radio.value == "No" and bill.remember[1] == "No"
      $(radio).attr "checked", "checked"
      $("#labelYes").attr "class", "ui-btn ui-radio-off ui-corner-left ui-btn-up-c"
      $("#labelNo").attr "class", "ui-btn ui-corner-right ui-controlgroup-last ui-radio-on ui-btn-active ui-btn-up-c"
  
  history.back()
  
  setTimeout(->
    @displayData()
  , 500)
  
deleteItem = (key, rev) ->
  ask = confirm "Are you sure you want to delete this bill?"
  if ask
    $.ajax
      type: "DELETE"
      url: @cloudantURL + key
      headers:
        "If-Match": rev
      success: (data) ->
        response = JSON.parse data
        if response.ok
          setInvalidated(true)
          $("#bill-"+key).animate
            opacity: 0.00
            height: 'toggle'
          , 1000
          setTimeout(->
            setInvalidated(true)
            history.back()
            @displayData(true, false)
          ,1000)
      error: (error) ->
        alert "ERROR: " + error.statusText
    return false
    
showAccount = (key) ->
  $("#li-account-"+key).animate
    opacity: 0.00
  , 500, ->
    $("#li-account-"+key).animate
      opacity: 1.00
    , 500, ->
      return

@clearStorage = () ->
  localStorage.clear();
  alert "All Data Has Been Deleted."
  
###**********************************************************
Click Events
**********************************************************###
$("#billForm").live "submit", (e) ->
  stopEvent(e)
  _rev = $('#_rev').val()
  isUpdate = ((typeof _rev isnt "undefined") and (_rev isnt null or ""))
  
  console.log isUpdate
  
  if $("#billForm").valid()
    if isUpdate
    
      updateJson = {}
      updateJson._id      = $("#_id").val()
      updateJson._rev     = $("#_rev").val()
      updateJson.name     = ["Name:", $("#name").val()]
      updateJson.payto    = ["Pay To:", $("#payTo").val()]
      updateJson.amount   = ["Amount:", $("#payAmount").val()]
      updateJson.account  = ["From Account:", $("#payFrom").val()]
      updateJson.payon    = ["Pay On:", $("#payOn").val()]
      updateJson.notes    = ["Notes:", $("#notes").val()]
      updateJson.remember = ["Remember This Payment:", getFavValue()]
      json = JSON.stringify updateJson

      console.log @cloudantURL + updateJson._id

      $.ajax
        type: "PUT"
        url: @cloudantURL + updateJson._id
        data: json
        success: (data) ->
          response = JSON.parse data
          if response.ok
            setInvalidated(true)
            @setKeyToEdit(0)
            $("legend").html("<h2>Create a New Bill</h2>")
            alert "Bill Updated Successfully!"
        error: (error) ->
          alert "ERROR: " + error.statusText
    else
      
      newJson = {}
      newJson.name     = ["Name:", $("#name").val()]
      newJson.payto    = ["Pay To:", $("#payTo").val()]
      newJson.amount   = ["Amount:", $("#payAmount").val()]
      newJson.account  = ["From Account:", $("#payFrom").val()]
      newJson.payon    = ["Pay On:", $("#payOn").val()]
      newJson.notes    = ["Notes:", $("#notes").val()]
      newJson.remember = ["Remember This Payment:", getFavValue()]
      json = JSON.stringify newJson
      
      $.ajax
        type: "POST"
        url: @cloudantURL
        dataType: "json"
        data: json
        success: (data) ->
          response = JSON.parse data
          if response.ok
            setInvalidated(true)
            alert("Bill Added!")
            @setKeyToEdit(0)
            @displayData()
        error: (error) ->
          alert "ERROR: " + error.statusText
  else
    $('html, body').animate( scrollTop: 0 , 0)
  return false
  
$("#billSearch").click("click", (e) ->
  $("#searchFormContainer").css "display", "block"
  $("#searchFormContainer").animate
    opacity: 1.00
  , 1000
  
  $("#billSearch").animate
    opacity: 0.00
  , 500
  setTimeout(->
    $("#billSearch").css "display", "none"
  , 500)
  
  setTimeout(->
    $("#billSearchHide").css "display", "inline"

    $("#billSearchHide").animate
      opacity: 1.00
    , 500
  , 500)
)

$("#billSearchHide").click("click", (e) ->
  $("#searchFormContainer").animate
    opacity: 0.00
  , 1000
  setTimeout(->
    $("#searchFormContainer").css "display", "none"
  , 1000)
  
  $("#billSearchHide").animate
    opacity: 0.00
  , 500
  setTimeout(->
    $("#billSearchHide").css "display", "none"
  , 500)
  
  setTimeout(->
    $("#billSearch").css "display", "inline"
    $("#billSearch").animate
      opacity: 1.00
    , 500
  , 500)
)

$("#viewBills").click("click", (e) =>
  stopEvent(e)
  setTimeout(->
    @displayData(true, false)
  , 700)
  $.mobile.changePage( "additem.html",
    transition: "slideup"
    showLoadMsg: true
  )
)

$("#accounts").click("click", (e) =>
  stopEvent(e)
  $.mobile.changePage( "accounts.html",
    showLoadMsg: true
  )
)

$("#faq").click("click", (e) =>
  stopEvent(e)
  $.mobile.changePage( "faq.html",
    showLoadMsg: true
  )
)

$("#addBill").click("click", (e) =>
  stopEvent(e)
  setTimeout(->
    @displayData(false, true)
  , 500)
  $.mobile.changePage( "additem.html",
    showLoadMsg: true
  )
)

$("#cta-bills").click("click", (e) =>
  stopEvent(e)
  setTimeout(->
    @displayData(false, true)
  , 500)
  $.mobile.changePage( "additem.html",
    showLoadMsg: true
  )
)

$("#searchForm").submit (e) =>
  stopEvent(e)
  setTimeout(->
    @displayData(true, false)
  , 500)
  $.mobile.changePage( "additem.html",
    showLoadMsg: true
  )
  false

###**********************************************************
Helper Methods
**********************************************************###
add0 = (n) ->
  (if n < 10 then "0" + n else "" + n)

getFavValue = ->
  radios = $("input[type='radio']")
  for radio in radios
    if radio.checked
      rememberValue = ""
      rememberValue = radio.value
      return rememberValue

stopEvent = (event) ->
  event.preventDefault()
  event.stopPropagation()
  if $.browser.msie
    event.originalEvent.keyCode = 0
    event.originalEvent.cancelBubble = true
    event.originalEvent.returnValue = false
    
viewItems = ->
  $("#itemsSection").css "display", "inline-block"
  return
  
hideItems = ->
  $("#itemsSection").css "display", "none"
  return
  
viewBillForm = ->
  $("#billForm").css "display", "inline"
  return
  
hideBillForm = ->
  $("#billForm").css "display", "none"
  return
  
@displayData = (showBills, showForm) =>
  bills = (if showBills isnt null or showBills isnt "" then showBills else false)
  form  = (if showForm isnt null or showForm isnt "" then showForm else false)

  if form
    #Bills are visible, show form
    @showForm()
    return

  else if bills
    #Form is visible, show bills
    @showBills()
    return
    
  else if getViewState()
    #Bills are visible, show form
    @showForm()
    return
  
  else
    #Form is visible, show bills
    @showBills()
    return
    
@showForm = () ->
  setViewState(false)
  hideItems()
  viewBillForm()
  $("#displayData").text "Display Data"
  $("#displayData").css "padding", "0.65em 15px 0.6em 15px"
  return
  
@showBills = () ->
  setViewState(true)
  hideBillForm()
  viewItems()
  if getDataDisplayed() == false or getInvalidated()
    destroyDataSet()
    getData()
    setDataDisplayed(true)
    setInvalidated(false)
  $("#displayData").text "Display Form"
  $("#displayData").css "padding", "0.65em 15px 0.6em 15px"
  return
    
unBindClickListeners = () ->
  $(document).unbind("click")
  
###**********************************************************
Add Account Page Form Methods
**********************************************************###
@actBank = ->
  if $("#accountBank").val() != null and $("#accountBank").val() != ""
    $("#actType").removeClass("hide").addClass("show")
  else
    alert "Please enter your bank account to conitue."
    
@actType = ->
  if $("#accountType").val() != null and $("#accountType").val() != ""
    if $("#accountType").val() == "credit"
      $("#actExp").removeClass("hide").addClass("show")
    else
      $("#actExp").removeClass("show").addClass("hide")
      $("#actNum").removeClass("hide").addClass("show")
  else
    alert "Please enter the account type to conitue."
    
@actExp = ->
  if $("#accountExpiration").val() != null and $("#accountExpiration").val() != ""
    $("#actNum").removeClass("hide").addClass("show")
  else
    alert "Please enter your credit cards expiration date to conitue."
    
@actNum = ->
  if $("#accountNumber").val() != null and $("#accountNumber").val() != ""
    $("#accountSubmitBtn").removeClass("hide").addClass("show")
  else
    alert "Please enter your credit cards expiration date to conitue."
    
@addAccount = (account) ->
  #something

$("#accountForm").live "submit", (e) ->
  stopEvent(e)
  formdata = $(this).serialize()
  $.ajax
    type: "POST"
    url: "accounts.html"
    data: formdata
    success: ->
      alert "Your account has been added! --THIS IS NOT ACTUALLING DOING ANYTHING JUST YET!--"
    error: (error) ->
      alert "ERROR: " + error.statusText

###**********************************************************
Bind to jQueries mobileinit
**********************************************************###
$(document).bind "mobileinit", ->
  $.mobile.accounts     = getAccounts
  $.mobile.date         = currentDate
  $.mobile.details      = setupBillDetails
  return

getAccounts = ->
  liSelect   = $("#selectAccounts")
  makeSelect = $("<select>")
  makeSelect.attr "id", "payFrom"
  makeSelect.attr "class", "required"
  for account in billAccounts
    makeOpt = $("<option>")
    makeOpt.attr "value", account
    makeOpt.html account
    makeSelect.append makeOpt
  liSelect.append makeSelect
  return

currentDate = ->
  currentTime = new Date()
  month = currentTime.getMonth()+1
  day = currentTime.getDate()
  year = currentTime.getFullYear()
  showDate = year + "-" + add0(month) + "-" + add0(day)
  $("#payOn").val showDate
  
setupBillDetails = (key, json) ->
  key = (if key isnt undefined then key else getDetailsKey())
  billObj = (if json isnt undefined then json else getDetailsJson())

  # Setup back button listener for details page
  $("#backToBills").click("click", (e) ->
    stopEvent(e)
    history.back()
    $("#li-key-"+key).removeClass("billClick").addClass("bill")
  )
  
  destroyDetailsDataSet()
  
  #Create unordered list
  makeList = $("<ul>")
  #Add list to "items" div
  $("#itemDetails").append makeList
  #Make a list item
  makeListItem = $("<li>")
  #Add the list item to the Unordered list
  makeList.append makeListItem
  
  #create a new Unordered list within the original Unordered list
  makeSubList = $("<ul>")

  #set class and id attribute for the new Unordered list for styling
  makeSubList.attr "id", "bill-"+key

  #Create a new img view for edit icon
  makeEditIcon = $("<img>")

  #Set src, class and id attribute on edit icon img view
  makeEditIcon.attr "src", "i/pencil.png"
  makeEditIcon.attr "class", "icons"
  makeEditIcon.attr "id", "edit-"+key

  #Create a new img view for delete icon
  makeDeleteIcon = $("<img>")

  #Set src, class and id attribute on delete icon img view
  makeDeleteIcon.attr "src", "i/x.png"
  makeDeleteIcon.attr "class", "icons"
  makeDeleteIcon.attr "id", "delete-"+key
  
  #Create a new img view for account icon
  makeAccountIcon = $("<img>")

  #Set src, class and id attribute on delete icon img view
  OPERATOR = ///
  ((Checking)|(Savings)|(Credit\sCard))+
  ///g

  account = billObj.account[1]
  accountMatch = (if account? then account.match(OPERATOR) else "Undefined")
  switch accountMatch[0]
    when "Checking" then makeAccountIcon.attr "src", "i/thumb_checking.png"
    when "Savings" then makeAccountIcon.attr "src", "i/thumb_savings.png"
    when "Credit Card" then makeAccountIcon.attr "src", "i/thumb_creditcard.png"
    when "Undefined" then makeAccountIcon.attr "src", "i/thumb_checking.png"
  
  makeAccountIcon.attr "class", "icons"
  makeAccountIcon.attr "id", "account-"+key
  
  #Add icons to subList
  makeSubList.append makeEditIcon
  makeSubList.append makeDeleteIcon
  makeSubList.append makeAccountIcon
  
  #Add the new Unordered list to the list item of original Unordered list
  makeListItem.append makeSubList
  
  #Set click listener on edit icon
  $("#edit-"+key).click("click", (e) ->
    editItem()
  )
  
  #Set click listener on delete icon
  $("#delete-"+key).click("click", (e) ->
    deleteItem(key, billObj._rev)
  )
  
  #Set click listener on account icon
  $("#account-"+key).click("click", (e) ->
    showAccount(key)
  )
  
  #for each bill in the billObj do the following
  _.each(billObj, (bill, key) ->
    #Make a list item
    makeSubListItem = $("<li>")
    
    if bill[0] == "From Account:"
      makeSubListItem.attr "id", "li-account-"+key
    
    #Add the list item to the new Unordered list
    makeSubList.append makeSubListItem
    
    #Create the text to display for each line
    field = $("<span>")
    value = $("<span>")
    
    field.attr "class", "billField"
    value.attr "class", "billValue"
      
                    
    #Add the text to the new list item
    makeSubListItem.append field
    makeSubListItem.append value
    
    switch key
      when "_id" then field.html "ID: "; value.html bill
      when "_rev" then field.html "Revision: "; value.html bill
      else field.html bill[0] + " "; value.html bill[1]

    true
  )
  $.mobile.changePage( "details.html",
    showLoadMsg: true
  )
  true

###****************************************************************
# Methods to show json / xml / csv
****************************************************************###
getStaticData = (data, type) ->
  
  switch type
    when "json" then createListWithJsonData(data)
    when "xml" then createListWithXMLData(data)
    when "csv" then createListWithCSVData(data)
      
createListWithJsonData = (data) ->
  i = 1
  _.each(setupStaticBills(data), (bill) ->
    key = bill.key
    
    makeListItem = $("<li>")
    makeListItem.attr "id", "li-key-"+key
    
    makeThumbIcon = $("<img>")
    makeThumbIcon.attr "class", "listThumbIcons"
    
    OPERATOR = ///
    ((Checking)|(Savings)|(Credit\sCard))+
    ///g

    account = bill.account[1]
    accountMatch = account.match(OPERATOR)
    switch accountMatch[0]
      when "Checking" then makeThumbIcon.attr "src", "i/checking_thumb.png"
      when "Savings" then makeThumbIcon.attr "src", "i/savings_thumb.png"
      when "Credit Card" then makeThumbIcon.attr "src", "i/credit_thumb.png"
      else makeThumbIcon.attr "src", "i/checking_thumb.png"
    
    makeArrowIcon = $("<img>")
    makeArrowIcon.attr "src", "i/arrow.png"
    makeArrowIcon.attr "class", "listArrowIcons"
    
    if(_.size(data) == i)
      makeListItem.attr "class", "lastBill"
    else
      makeListItem.attr "class", "bill"
    
    makeLink = $("<a>")
    makeLink.attr "href", "#"
    makeListItem.append makeLink
    makeListItem.append makeThumbIcon
    makeListItem.append makeArrowIcon

    $("#homeItems").append makeListItem
    
    $("#li-key-"+key).click("click", (e) ->
      stopEvent(e)
      $(this).removeClass("bill").addClass("billClicked")
      setDetailsKey(key)
      $.mobile.changePage( "details.html",
        showLoadMsg: true
      )
      return false
    )
    
    payTo = bill.payto[1]
    if payTo.length >= 20
      payTo = payTo.substr(0, 20) + "…"
      
    payAmount = "$" + bill.amount[1]
    payDate = "(" + bill.payon[1] + ")"

    makeLink.html payTo + " " + payAmount + " " + payDate
    
    i++
  )
  
createListWithXMLData = (data) ->
  
  bills = $(data).find('bill')
  
  i = 1
  _.each(bills, (bill) ->
    key = $(bill).find("id").text()
    
    makeListItem = $("<li>")
    makeListItem.attr "id", "li-key-"+key
    
    makeThumbIcon = $("<img>")
    makeThumbIcon.attr "class", "listThumbIcons"
    
    OPERATOR = ///
    ((Checking)|(Savings)|(Credit\sCard))+
    ///g

    account = $(bill).find("account").text()
    accountMatch = account.match(OPERATOR)
    switch accountMatch[0]
      when "Checking" then makeThumbIcon.attr "src", "i/checking_thumb.png"
      when "Savings" then makeThumbIcon.attr "src", "i/savings_thumb.png"
      when "Credit Card" then makeThumbIcon.attr "src", "i/credit_thumb.png"
      else makeThumbIcon.attr "src", "i/checking_thumb.png"
    
    makeArrowIcon = $("<img>")
    makeArrowIcon.attr "src", "i/arrow.png"
    makeArrowIcon.attr "class", "listArrowIcons"

    if(_.size(bills) == i)
      makeListItem.attr "class", "lastBill"
    else
      makeListItem.attr "class", "bill"
    
    makeLink = $("<a>")
    makeLink.attr "href", "#"
    makeListItem.append makeLink
    makeListItem.append makeThumbIcon
    makeListItem.append makeArrowIcon

    $("#homeItems").append makeListItem
    
    $("#li-key-"+key).click("click", (e) ->
      stopEvent(e)
      $(this).removeClass("bill").addClass("billClicked")
      setDetailsKey(key)
      $.mobile.changePage( "details.html",
        showLoadMsg: true
      )
      return false
    )
    
    payTo = $(bill).find("payto").text()
    if payTo.length >= 20
      payTo = payTo.substr(0, 20) + "…"
      
    payAmount = "$" + $(bill).find("amount").text()
    payDate = "(" + $(bill).find("payon").text() + ")"

    makeLink.html payTo + " " + payAmount + " " + payDate
    
    i++
  )
  
createListWithCSVData = (data) ->
  
  bills = csvToArray(data)
  
  i = 1
  _.each(bills, (bill) ->
    key = ""
    _.find(bill, (details) ->
      key = details[1]
      
      makeListItem = $("<li>")
      makeListItem.attr "id", "li-key-"+key
      
      makeThumbIcon = $("<img>")
      makeThumbIcon.attr "class", "listThumbIcons"
      
      OPERATOR = ///
      ((Checking)|(Savings)|(Credit\sCard))+
      ///g
  
      account = details[9]
      accountMatch = account.match(OPERATOR)
      switch accountMatch
        when "Checking" then makeThumbIcon.attr "src", "i/checking_thumb.png"
        when "Savings" then makeThumbIcon.attr "src", "i/savings_thumb.png"
        when "Credit Card" then makeThumbIcon.attr "src", "i/credit_thumb.png"
        else makeThumbIcon.attr "src", "i/checking_thumb.png"
      
      makeArrowIcon = $("<img>")
      makeArrowIcon.attr "src", "i/arrow.png"
      makeArrowIcon.attr "class", "listArrowIcons"
  
      if(_.size(bills) == i)
        makeListItem.attr "class", "lastBill"
      else
        makeListItem.attr "class", "bill"
      
      makeLink = $("<a>")
      makeLink.attr "href", "#"
      makeListItem.append makeLink
      makeListItem.append makeThumbIcon
      makeListItem.append makeArrowIcon
  
      $("#homeItems").append makeListItem
      
      $("#li-key-"+key).click("click", (e) ->
        stopEvent(e)
        $(this).removeClass("bill").addClass("billClicked")
        setDetailsKey(key)
        $.mobile.changePage( "details.html",
          showLoadMsg: true
        )
        return false
      )
      
      payTo = details[5]
      if payTo.length >= 20
        payTo = payTo.substr(0, 20) + "…"
        
      payAmount = "$" + details[7]
      payDate = "(" + details[11] + ")"
  
      makeLink.html payTo + " " + payAmount + " " + payDate
      
    )
    i++
  )
      
setupStaticBills = (data) ->
  billsList = []

  _.each(data, (value, key) ->
    billObj = value
    billObj.key = key    
    billsList.push billObj
  )

  callbackFunc = (a, b) ->
    if a.payon[1] is b.payon[1]
      return 0 if a.payon[1] is b.payon[1]
      return (if (a.payon[1] < b.payon[1]) then -1 else 1)
    (if (a.payon[1] < b.payon[1]) then -1 else 1)
  
  billsList.sort callbackFunc
  
###**********************************************************
# JSON
**********************************************************###
$("#displayJson").live("click", (e) =>

  stopEvent(e)
  if getViewState()
    setInvalidated(true)
    @displayStaticData(false, true, null, "json")
    $("#displayJson").text "Load JSON"
    $("#displayJson").css "padding", "0.65em 15px 0.6em 15px"
  else
    loadJson()
)

loadJson = ->
  $.ajax
    url: "data/data.json"
    dataType: "json"
    success: (json) =>
      @displayStaticData(true, false, json, "json")
      $("#displayJson").text "Show Home"
      $("#displayJson").css "padding", "0.65em 15px 0.6em 15px"
    error: (error) ->
      alert "ERROR: " + error

###**********************************************************
# XML
**********************************************************###
$("#displayXML").live("click", (e) =>

  stopEvent(e)
  if getViewState()
    setInvalidated(true)
    @displayStaticData(false, true, null, "xml")
    $("#displayXML").text "Load XML"
    $("#displayXML").css "padding", "0.65em 15px 0.6em 15px"
  else
    loadXML()
)

loadXML = ->
  $.ajax
    url: "data/data.xml"
    dataType: "xml"
    success: (xml) =>
      @displayStaticData(true, false, xml, "xml")
      $("#displayXML").text "Show Home"
      $("#displayXML").css "padding", "0.65em 15px 0.6em 15px"
    error: (error) ->
      alert "ERROR: " + error.statusText

###**********************************************************
# CSV
**********************************************************###
$("#displayCSV").live("click", (e) =>

  stopEvent(e)
  if getViewState()
    setInvalidated(true)
    @displayStaticData(false, true, null, "csv")
    $("#displayCSV").text "Load CSV"
    $("#displayCSV").css "padding", "0.65em 15px 0.6em 15px"
  else
    loadCSV()
)

loadCSV = ->
  $.ajax
    url: "data/data.csv"
    dataType: "text"
    success: (csv) =>
      @displayStaticData(true, false, csv, "csv")
      $("#displayCSV").text "Show Home"
      $("#displayCSV").css "padding", "0.65em 15px 0.6em 15px"
    error: (error) ->
      alert "ERROR: " + error.statusText

csvToArray = (strData, strDelimiter) ->
  strDelimiter = (strDelimiter or ",")
  quote_regexp = new RegExp("^\"(.*)\"$")
  arrData = []
  lines = strData.split(new RegExp("\r?[\r\n]"))
  
  _.each(lines, (value, key) ->
    arrData.push { key : value.split(strDelimiter) }
    
  )

  arrData
      
@displayStaticData = (showBills, showHome, data, type) =>
  bills = (if showBills isnt null or showBills isnt "" then showBills else false)
  form  = (if showHome isnt null or showHome isnt "" then showHome else false)
  
  if form
    #Bills are visible, show form
    switch type
      when "json" then @showHomeJson()
      when "xml" then @showHomeXML()
      when "csv" then @showHomeCSV()
    return

  else if bills
    #Form is visible, show bills
    @showStaticBills(data, type)
    return
    
  else if getViewState()
    #Bills are visible, show form
    switch type
      when "json" then @showHomeJson()
      when "xml" then @showHomeXML()
      when "csv" then @showHomeCSV()
    return
  
  else
    #Form is visible, show bills
    @showStaticBills(data, type)
    return
    
@showStaticBills = (data, type) ->
  setViewState(true)
  hideHome()
  viewStaticItems()
  if getDataDisplayed() == false or getInvalidated()
    destroyStaticDataSet()
    getStaticData(data, type)
    setDataDisplayed(true)
    setInvalidated(false)
  return
  
@showHomeJson = () ->
  setViewState(false)
  hideStaticItems()
  viewHome()
  $("#displayData").text "Load Json"
  $("#displayData").css "padding", "0.65em 15px 0.6em 15px"
  return

@showHomeXML = () ->
  setViewState(false)
  hideStaticItems()
  viewHome()
  $("#displayData").text "Load XML"
  $("#displayData").css "padding", "0.65em 15px 0.6em 15px"
  return
  
@showHomeCSV = () ->
  setViewState(false)
  hideStaticItems()
  viewHome()
  $("#displayData").text "Load CSV"
  $("#displayData").css "padding", "0.65em 15px 0.6em 15px"
  return
  
destroyStaticDataSet = () ->
  $("#homeItems").empty()
  
viewHome = ->
  $("#unoslider").css "display", "inline"
  $("#grid").css "display", "inline-block"
  return

hideHome = ->
  $("#unoslider").css "display", "none"
  $("#grid").css "display", "none"
  return
  
viewStaticItems = ->
  $("#homeItemsSection").css "display", "inline-block"
  return
  
hideStaticItems = ->
  $("#homeItemsSection").css "display", "none"
  return
