
/*
Deliverable 2
Author: Jeremy Fox
Created For: ASD Online
main.coffee (main.js)
*/

/*
Variables
*/

(function() {
  var add0, billAccounts, createListWithCSVData, createListWithJsonData, createListWithXMLData, csvToArray, currentDate, deleteItem, destroyDataSet, destroyDetailsDataSet, destroyStaticDataSet, editItem, getAccounts, getBill, getData, getDataDisplayed, getDetailsJson, getDetailsKey, getFavValue, getInvalidated, getStaticData, getViewState, hideBillForm, hideHome, hideItems, hideStaticItems, loadCSV, loadJson, loadXML, qryBills, setDataDisplayed, setDetailsJson, setDetailsKey, setInvalidated, setViewState, setupBillDetails, setupBills, setupStaticBills, showAccount, stopEvent, storeJsonData, unBindClickListeners, viewBillForm, viewHome, viewItems, viewStaticItems,
    _this = this;

  this.dataViewState = false;

  this.hasDataBeenDisplayed = false;

  this.invalidateData = false;

  this.keyToEdit = 0;

  this.cloudantURL = "https://onglandistanyboubtaindeg:7kD3juiBXaEP82dEXBmiGQkX@atljeremy.cloudant.com/billplannerdata/";

  billAccounts = ["Please Select An Account", "Bank of America - Checking", "Bank of America - Savings", "Bank of America - Credit Card", "Wells Fargo - Checking", "Wells Fargo - Savings", "Wells Fargo - Credit Card"];

  this.detailsKey = "";

  this.detailsJson = null;

  /***********************************************************
  State Control Methods
  **********************************************************
  */

  setViewState = function(state) {
    return _this.dataViewState = state;
  };

  getViewState = function() {
    return _this.dataViewState;
  };

  setDataDisplayed = function(val) {
    return _this.hasDataBeenDisplayed = val;
  };

  getDataDisplayed = function() {
    return _this.hasDataBeenDisplayed;
  };

  setInvalidated = function(val) {
    return _this.invalidateData = val;
  };

  getInvalidated = function() {
    return _this.invalidateData;
  };

  destroyDataSet = function() {
    return $("#items").empty();
  };

  destroyDetailsDataSet = function() {
    return $("#itemDetails").empty();
  };

  /***********************************************************
  Getter and Setter for key to edit
  **********************************************************
  */

  this.getKeyToEdit = function() {
    return _this.keyToEdit;
  };

  this.setKeyToEdit = function(key) {
    return _this.keyToEdit = key;
  };

  /***********************************************************
  Getter and Setter for details key
  **********************************************************
  */

  setDetailsKey = function(key) {
    return _this.detailsKey = key;
  };

  getDetailsKey = function() {
    return _this.detailsKey;
  };

  /***********************************************************
  Getter and Setter for details json
  **********************************************************
  */

  setDetailsJson = function(json) {
    return _this.detailsJson = json;
  };

  getDetailsJson = function() {
    return _this.detailsJson;
  };

  /***********************************************************
  Main Metheds
  **********************************************************
  */

  this.storeData = function() {
    var item, itemId, newDate;
    newDate = new Date();
    if (_this.getKeyToEdit() === 0 || _this.getKeyToEdit() === "") {
      itemId = newDate.getTime();
    } else {
      itemId = _this.getKeyToEdit();
    }
    item = {};
    item.name = ["Name:", $("#name").val()];
    item.payto = ["Pay To:", $("#payTo").val()];
    item.amount = ["Amount:", $("#payAmount").val()];
    item.account = ["From Account:", $("#payFrom").val()];
    item.payon = ["Pay On:", $("#payOn").val()];
    item.notes = ["Notes:", $("#notes").val()];
    item.remember = ["Remember This Payment:", getFavValue()];
    try {
      localStorage.setItem(itemId, JSON.stringify(item));
      setInvalidated(true);
      alert("Bill Added!");
      _this.setKeyToEdit(0);
      $("legend").html("<h2>Create a New Bill</h2>");
      _this.displayData();
    } catch (e) {
      return alert(e);
    }
  };

  storeJsonData = function() {
    _.each(_.keys(_this.json), function(key) {
      var item;
      item = this.json[key];
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {
        return alert(e);
      }
    });
    setInvalidated(true);
    return getData();
  };

  getData = function() {
    return $.ajax({
      url: "/billplannerdata/_all_docs?include_docs=true",
      dataType: "json",
      success: function(data) {
        if (_.size(data.rows) > 0) {
          return qryBills(data);
        } else {
          return alert("Nothing to show!");
        }
      },
      error: function(error) {
        return alert("ERROR: " + error.statusText);
      }
    });
  };

  getBill = function(key) {
    return $.ajax({
      url: "/billplannerdata/" + key,
      dataType: "json",
      success: function(data) {
        if (data._id === key) {
          setDetailsJson(data);
          return setupBillDetails(data._id, data);
        } else {
          return alert("ERROR 001: This bill could not be found.");
        }
      },
      error: function(error) {
        return alert("ERROR 002: " + error.statusText);
      }
    });
  };

  setupBills = function(json) {
    var billsList, callbackFunc;
    billsList = [];
    _.each(json.rows, function(value, key) {
      var billObj;
      billObj = value.doc;
      billObj.key = value.key;
      return billsList.push(billObj);
    });
    callbackFunc = function(a, b) {
      if (a.payon[1] === b.payon[1]) {
        if (a.payon[1] === b.payon[1]) return 0;
        return (a.payon[1] < b.payon[1] ? -1 : 1);
      }
      if (a.payon[1] < b.payon[1]) {
        return -1;
      } else {
        return 1;
      }
    };
    if (_.size(billsList) > 1) {
      return billsList.sort(callbackFunc);
    } else {
      return billsList;
    }
  };

  qryBills = function(json) {
    var i;
    i = 1;
    return _.each(setupBills(json), function(bill) {
      var OPERATOR, account, accountMatch, key, makeArrowIcon, makeLink, makeListItem, makeThumbIcon, payAmount, payDate, payTo;
      key = bill.key;
      makeListItem = $("<li>");
      makeListItem.attr("id", "li-key-" + key);
      makeThumbIcon = $("<img>");
      makeThumbIcon.attr("class", "listThumbIcons");
      OPERATOR = /((Checking)|(Savings)|(Credit\sCard))+/g;
      account = bill.account[1];
      accountMatch = account.match(OPERATOR);
      switch (accountMatch[0]) {
        case "Checking":
          makeThumbIcon.attr("src", "i/checking_thumb.png");
          break;
        case "Savings":
          makeThumbIcon.attr("src", "i/savings_thumb.png");
          break;
        case "Credit Card":
          makeThumbIcon.attr("src", "i/credit_thumb.png");
          break;
        default:
          makeThumbIcon.attr("src", "i/checking_thumb.png");
      }
      makeArrowIcon = $("<img>");
      makeArrowIcon.attr("src", "i/arrow.png");
      makeArrowIcon.attr("class", "listArrowIcons");
      if (_.size(json.rows) === i) {
        makeListItem.attr("class", "lastBill");
      } else {
        makeListItem.attr("class", "bill");
      }
      makeLink = $("<a>");
      makeLink.attr("href", "#");
      makeListItem.append(makeLink);
      makeListItem.append(makeThumbIcon);
      makeListItem.append(makeArrowIcon);
      $("#items").append(makeListItem);
      $("#li-key-" + key).click("click", function(e) {
        stopEvent(e);
        $(this).removeClass("bill").addClass("billClicked");
        setDetailsKey(key);
        getBill(key);
        return false;
      });
      payTo = bill.payto[1];
      if (payTo.length >= 20) payTo = payTo.substr(0, 20) + "…";
      payAmount = "$" + bill.amount[1];
      payDate = "(" + bill.payon[1] + ")";
      makeLink.html(payTo + " " + payAmount + " " + payDate);
      return i++;
    });
  };

  editItem = function() {
    var bill, key, radio, radios, _i, _id, _len, _rev;
    bill = getDetailsJson();
    key = bill._id;
    _this.setKeyToEdit(key);
    $("legend").html("<h2>Your Editing a Bill - <a href=\"#\" id=\"cancelEdit\" data-ajax=\"false\" >Cancel</a></h2>");
    $("#cancelEdit").click("click", function(e) {
      return $.mobile.changePage('additem.html', {
        reloadPage: true,
        allowSamePageTranstion: true,
        transition: 'slide'
      });
    });
    $('#name').val(bill.name[1]);
    $('#payTo').val(bill.payto[1]);
    $('#payAmount').val(bill.amount[1]);
    $('#payFrom').val(bill.account[1]);
    $('#payOn').val(bill.payon[1]);
    $('#notes').val(bill.notes[1]);
    _rev = $('<input>').attr('id', '_rev').attr('name', '_rev').attr('type', 'hidden').val(bill._rev);
    _id = $('<input>').attr('id', '_id').attr('name', '_id').attr('type', 'hidden').val(bill._id);
    $('#billForm').append(_rev);
    $('#billForm').append(_id);
    radios = $("input[type='radio']");
    for (_i = 0, _len = radios.length; _i < _len; _i++) {
      radio = radios[_i];
      if (radio.value === "Yes" && bill.remember[1] === "Yes") {
        $(radio).attr("checked", "checked");
        $("#labelNo").attr("class", "ui-btn ui-corner-right ui-controlgroup-last ui-radio-off ui-btn-up-c");
        $("#labelYes").attr("class", "ui-btn ui-corner-left ui-btn-up-c ui-radio-on ui-btn-active");
      } else if (radio.value === "No" && bill.remember[1] === "No") {
        $(radio).attr("checked", "checked");
        $("#labelYes").attr("class", "ui-btn ui-radio-off ui-corner-left ui-btn-up-c");
        $("#labelNo").attr("class", "ui-btn ui-corner-right ui-controlgroup-last ui-radio-on ui-btn-active ui-btn-up-c");
      }
    }
    history.back();
    return setTimeout(function() {
      return this.displayData();
    }, 500);
  };

  deleteItem = function(key, rev) {
    var ask;
    ask = confirm("Are you sure you want to delete this bill?");
    if (ask) {
      $.ajax({
        type: "DELETE",
        url: this.cloudantURL + key,
        headers: {
          "If-Match": rev
        },
        success: function(data) {
          var response;
          response = JSON.parse(data);
          if (response.ok) {
            setInvalidated(true);
            $("#bill-" + key).animate({
              opacity: 0.00,
              height: 'toggle'
            }, 1000);
            return setTimeout(function() {
              setInvalidated(true);
              history.back();
              return this.displayData(true, false);
            }, 1000);
          }
        },
        error: function(error) {
          return alert("ERROR: " + error.statusText);
        }
      });
      return false;
    }
  };

  showAccount = function(key) {
    return $("#li-account-" + key).animate({
      opacity: 0.00
    }, 500, function() {
      return $("#li-account-" + key).animate({
        opacity: 1.00
      }, 500, function() {});
    });
  };

  this.clearStorage = function() {
    localStorage.clear();
    return alert("All Data Has Been Deleted.");
  };

  /***********************************************************
  Click Events
  **********************************************************
  */

  $("#billForm").live("submit", function(e) {
    var isUpdate, json, newJson, updateJson, _rev;
    stopEvent(e);
    _rev = $('#_rev').val();
    isUpdate = (typeof _rev !== "undefined") && (_rev !== null || "");
    console.log(isUpdate);
    if ($("#billForm").valid()) {
      if (isUpdate) {
        updateJson = {};
        updateJson._id = $("#_id").val();
        updateJson._rev = $("#_rev").val();
        updateJson.name = ["Name:", $("#name").val()];
        updateJson.payto = ["Pay To:", $("#payTo").val()];
        updateJson.amount = ["Amount:", $("#payAmount").val()];
        updateJson.account = ["From Account:", $("#payFrom").val()];
        updateJson.payon = ["Pay On:", $("#payOn").val()];
        updateJson.notes = ["Notes:", $("#notes").val()];
        updateJson.remember = ["Remember This Payment:", getFavValue()];
        json = JSON.stringify(updateJson);
        console.log(this.cloudantURL + updateJson._id);
        $.ajax({
          type: "PUT",
          url: this.cloudantURL + updateJson._id,
          data: json,
          success: function(data) {
            var response;
            response = JSON.parse(data);
            if (response.ok) {
              setInvalidated(true);
              this.setKeyToEdit(0);
              $("legend").html("<h2>Create a New Bill</h2>");
              return alert("Bill Updated Successfully!");
            }
          },
          error: function(error) {
            return alert("ERROR: " + error.statusText);
          }
        });
      } else {
        newJson = {};
        newJson.name = ["Name:", $("#name").val()];
        newJson.payto = ["Pay To:", $("#payTo").val()];
        newJson.amount = ["Amount:", $("#payAmount").val()];
        newJson.account = ["From Account:", $("#payFrom").val()];
        newJson.payon = ["Pay On:", $("#payOn").val()];
        newJson.notes = ["Notes:", $("#notes").val()];
        newJson.remember = ["Remember This Payment:", getFavValue()];
        json = JSON.stringify(newJson);
        $.ajax({
          type: "POST",
          url: this.cloudantURL,
          dataType: "json",
          data: json,
          success: function(data) {
            var response;
            response = JSON.parse(data);
            if (response.ok) {
              setInvalidated(true);
              alert("Bill Added!");
              this.setKeyToEdit(0);
              return this.displayData();
            }
          },
          error: function(error) {
            return alert("ERROR: " + error.statusText);
          }
        });
      }
    } else {
      $('html, body').animate({
        scrollTop: 0
      }, 0);
    }
    return false;
  });

  $("#billSearch").click("click", function(e) {
    $("#searchFormContainer").css("display", "block");
    $("#searchFormContainer").animate({
      opacity: 1.00
    }, 1000);
    $("#billSearch").animate({
      opacity: 0.00
    }, 500);
    setTimeout(function() {
      return $("#billSearch").css("display", "none");
    }, 500);
    return setTimeout(function() {
      $("#billSearchHide").css("display", "inline");
      return $("#billSearchHide").animate({
        opacity: 1.00
      }, 500);
    }, 500);
  });

  $("#billSearchHide").click("click", function(e) {
    $("#searchFormContainer").animate({
      opacity: 0.00
    }, 1000);
    setTimeout(function() {
      return $("#searchFormContainer").css("display", "none");
    }, 1000);
    $("#billSearchHide").animate({
      opacity: 0.00
    }, 500);
    setTimeout(function() {
      return $("#billSearchHide").css("display", "none");
    }, 500);
    return setTimeout(function() {
      $("#billSearch").css("display", "inline");
      return $("#billSearch").animate({
        opacity: 1.00
      }, 500);
    }, 500);
  });

  $("#viewBills").click("click", function(e) {
    stopEvent(e);
    setTimeout(function() {
      return this.displayData(true, false);
    }, 700);
    return $.mobile.changePage("additem.html", {
      transition: "slideup",
      showLoadMsg: true
    });
  });

  $("#accounts").click("click", function(e) {
    stopEvent(e);
    return $.mobile.changePage("accounts.html", {
      showLoadMsg: true
    });
  });

  $("#faq").click("click", function(e) {
    stopEvent(e);
    return $.mobile.changePage("faq.html", {
      showLoadMsg: true
    });
  });

  $("#addBill").click("click", function(e) {
    stopEvent(e);
    setTimeout(function() {
      return this.displayData(false, true);
    }, 500);
    return $.mobile.changePage("additem.html", {
      showLoadMsg: true
    });
  });

  $("#cta-bills").click("click", function(e) {
    stopEvent(e);
    setTimeout(function() {
      return this.displayData(false, true);
    }, 500);
    return $.mobile.changePage("additem.html", {
      showLoadMsg: true
    });
  });

  $("#searchForm").submit(function(e) {
    stopEvent(e);
    setTimeout(function() {
      return this.displayData(true, false);
    }, 500);
    $.mobile.changePage("additem.html", {
      showLoadMsg: true
    });
    return false;
  });

  /***********************************************************
  Helper Methods
  **********************************************************
  */

  add0 = function(n) {
    if (n < 10) {
      return "0" + n;
    } else {
      return "" + n;
    }
  };

  getFavValue = function() {
    var radio, radios, rememberValue, _i, _len;
    radios = $("input[type='radio']");
    for (_i = 0, _len = radios.length; _i < _len; _i++) {
      radio = radios[_i];
      if (radio.checked) {
        rememberValue = "";
        rememberValue = radio.value;
        return rememberValue;
      }
    }
  };

  stopEvent = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if ($.browser.msie) {
      event.originalEvent.keyCode = 0;
      event.originalEvent.cancelBubble = true;
      return event.originalEvent.returnValue = false;
    }
  };

  viewItems = function() {
    $("#itemsSection").css("display", "inline-block");
  };

  hideItems = function() {
    $("#itemsSection").css("display", "none");
  };

  viewBillForm = function() {
    $("#billForm").css("display", "inline");
  };

  hideBillForm = function() {
    $("#billForm").css("display", "none");
  };

  this.displayData = function(showBills, showForm) {
    var bills, form;
    bills = (showBills !== null || showBills !== "" ? showBills : false);
    form = (showForm !== null || showForm !== "" ? showForm : false);
    if (form) {
      _this.showForm();
    } else if (bills) {
      _this.showBills();
    } else if (getViewState()) {
      _this.showForm();
    } else {
      _this.showBills();
    }
  };

  this.showForm = function() {
    setViewState(false);
    hideItems();
    viewBillForm();
    $("#displayData").text("Display Data");
    $("#displayData").css("padding", "0.65em 15px 0.6em 15px");
  };

  this.showBills = function() {
    setViewState(true);
    hideBillForm();
    viewItems();
    if (getDataDisplayed() === false || getInvalidated()) {
      destroyDataSet();
      getData();
      setDataDisplayed(true);
      setInvalidated(false);
    }
    $("#displayData").text("Display Form");
    $("#displayData").css("padding", "0.65em 15px 0.6em 15px");
  };

  unBindClickListeners = function() {
    return $(document).unbind("click");
  };

  /***********************************************************
  Add Account Page Form Methods
  **********************************************************
  */

  this.actBank = function() {
    if ($("#accountBank").val() !== null && $("#accountBank").val() !== "") {
      return $("#actType").removeClass("hide").addClass("show");
    } else {
      return alert("Please enter your bank account to conitue.");
    }
  };

  this.actType = function() {
    if ($("#accountType").val() !== null && $("#accountType").val() !== "") {
      if ($("#accountType").val() === "credit") {
        return $("#actExp").removeClass("hide").addClass("show");
      } else {
        $("#actExp").removeClass("show").addClass("hide");
        return $("#actNum").removeClass("hide").addClass("show");
      }
    } else {
      return alert("Please enter the account type to conitue.");
    }
  };

  this.actExp = function() {
    if ($("#accountExpiration").val() !== null && $("#accountExpiration").val() !== "") {
      return $("#actNum").removeClass("hide").addClass("show");
    } else {
      return alert("Please enter your credit cards expiration date to conitue.");
    }
  };

  this.actNum = function() {
    if ($("#accountNumber").val() !== null && $("#accountNumber").val() !== "") {
      return $("#accountSubmitBtn").removeClass("hide").addClass("show");
    } else {
      return alert("Please enter your credit cards expiration date to conitue.");
    }
  };

  this.addAccount = function(account) {};

  $("#accountForm").live("submit", function(e) {
    var formdata;
    stopEvent(e);
    formdata = $(this).serialize();
    return $.ajax({
      type: "POST",
      url: "accounts.html",
      data: formdata,
      success: function() {
        return alert("Your account has been added! --THIS IS NOT ACTUALLING DOING ANYTHING JUST YET!--");
      },
      error: function(error) {
        return alert("ERROR: " + error.statusText);
      }
    });
  });

  /***********************************************************
  Bind to jQueries mobileinit
  **********************************************************
  */

  $(document).bind("mobileinit", function() {
    $.mobile.accounts = getAccounts;
    $.mobile.date = currentDate;
    $.mobile.details = setupBillDetails;
  });

  getAccounts = function() {
    var account, liSelect, makeOpt, makeSelect, _i, _len;
    liSelect = $("#selectAccounts");
    makeSelect = $("<select>");
    makeSelect.attr("id", "payFrom");
    makeSelect.attr("class", "required");
    for (_i = 0, _len = billAccounts.length; _i < _len; _i++) {
      account = billAccounts[_i];
      makeOpt = $("<option>");
      makeOpt.attr("value", account);
      makeOpt.html(account);
      makeSelect.append(makeOpt);
    }
    liSelect.append(makeSelect);
  };

  currentDate = function() {
    var currentTime, day, month, showDate, year;
    currentTime = new Date();
    month = currentTime.getMonth() + 1;
    day = currentTime.getDate();
    year = currentTime.getFullYear();
    showDate = year + "-" + add0(month) + "-" + add0(day);
    return $("#payOn").val(showDate);
  };

  setupBillDetails = function(key, json) {
    var OPERATOR, account, accountMatch, billObj, makeAccountIcon, makeDeleteIcon, makeEditIcon, makeList, makeListItem, makeSubList;
    key = (key !== void 0 ? key : getDetailsKey());
    billObj = (json !== void 0 ? json : getDetailsJson());
    $("#backToBills").click("click", function(e) {
      stopEvent(e);
      history.back();
      return $("#li-key-" + key).removeClass("billClick").addClass("bill");
    });
    destroyDetailsDataSet();
    makeList = $("<ul>");
    $("#itemDetails").append(makeList);
    makeListItem = $("<li>");
    makeList.append(makeListItem);
    makeSubList = $("<ul>");
    makeSubList.attr("id", "bill-" + key);
    makeEditIcon = $("<img>");
    makeEditIcon.attr("src", "i/pencil.png");
    makeEditIcon.attr("class", "icons");
    makeEditIcon.attr("id", "edit-" + key);
    makeDeleteIcon = $("<img>");
    makeDeleteIcon.attr("src", "i/x.png");
    makeDeleteIcon.attr("class", "icons");
    makeDeleteIcon.attr("id", "delete-" + key);
    makeAccountIcon = $("<img>");
    OPERATOR = /((Checking)|(Savings)|(Credit\sCard))+/g;
    account = billObj.account[1];
    accountMatch = (account != null ? account.match(OPERATOR) : "Undefined");
    switch (accountMatch[0]) {
      case "Checking":
        makeAccountIcon.attr("src", "i/thumb_checking.png");
        break;
      case "Savings":
        makeAccountIcon.attr("src", "i/thumb_savings.png");
        break;
      case "Credit Card":
        makeAccountIcon.attr("src", "i/thumb_creditcard.png");
        break;
      case "Undefined":
        makeAccountIcon.attr("src", "i/thumb_checking.png");
    }
    makeAccountIcon.attr("class", "icons");
    makeAccountIcon.attr("id", "account-" + key);
    makeSubList.append(makeEditIcon);
    makeSubList.append(makeDeleteIcon);
    makeSubList.append(makeAccountIcon);
    makeListItem.append(makeSubList);
    $("#edit-" + key).click("click", function(e) {
      return editItem();
    });
    $("#delete-" + key).click("click", function(e) {
      return deleteItem(key, billObj._rev);
    });
    $("#account-" + key).click("click", function(e) {
      return showAccount(key);
    });
    _.each(billObj, function(bill, key) {
      var field, makeSubListItem, value;
      makeSubListItem = $("<li>");
      if (bill[0] === "From Account:") {
        makeSubListItem.attr("id", "li-account-" + key);
      }
      makeSubList.append(makeSubListItem);
      field = $("<span>");
      value = $("<span>");
      field.attr("class", "billField");
      value.attr("class", "billValue");
      makeSubListItem.append(field);
      makeSubListItem.append(value);
      switch (key) {
        case "_id":
          field.html("ID: ");
          value.html(bill);
          break;
        case "_rev":
          field.html("Revision: ");
          value.html(bill);
          break;
        default:
          field.html(bill[0] + " ");
          value.html(bill[1]);
      }
      return true;
    });
    $.mobile.changePage("details.html", {
      showLoadMsg: true
    });
    return true;
  };

  /*****************************************************************
  # Methods to show json / xml / csv
  ****************************************************************
  */

  getStaticData = function(data, type) {
    switch (type) {
      case "json":
        return createListWithJsonData(data);
      case "xml":
        return createListWithXMLData(data);
      case "csv":
        return createListWithCSVData(data);
    }
  };

  createListWithJsonData = function(data) {
    var i;
    i = 1;
    return _.each(setupStaticBills(data), function(bill) {
      var OPERATOR, account, accountMatch, key, makeArrowIcon, makeLink, makeListItem, makeThumbIcon, payAmount, payDate, payTo;
      key = bill.key;
      makeListItem = $("<li>");
      makeListItem.attr("id", "li-key-" + key);
      makeThumbIcon = $("<img>");
      makeThumbIcon.attr("class", "listThumbIcons");
      OPERATOR = /((Checking)|(Savings)|(Credit\sCard))+/g;
      account = bill.account[1];
      accountMatch = account.match(OPERATOR);
      switch (accountMatch[0]) {
        case "Checking":
          makeThumbIcon.attr("src", "i/checking_thumb.png");
          break;
        case "Savings":
          makeThumbIcon.attr("src", "i/savings_thumb.png");
          break;
        case "Credit Card":
          makeThumbIcon.attr("src", "i/credit_thumb.png");
          break;
        default:
          makeThumbIcon.attr("src", "i/checking_thumb.png");
      }
      makeArrowIcon = $("<img>");
      makeArrowIcon.attr("src", "i/arrow.png");
      makeArrowIcon.attr("class", "listArrowIcons");
      if (_.size(data) === i) {
        makeListItem.attr("class", "lastBill");
      } else {
        makeListItem.attr("class", "bill");
      }
      makeLink = $("<a>");
      makeLink.attr("href", "#");
      makeListItem.append(makeLink);
      makeListItem.append(makeThumbIcon);
      makeListItem.append(makeArrowIcon);
      $("#homeItems").append(makeListItem);
      $("#li-key-" + key).click("click", function(e) {
        stopEvent(e);
        $(this).removeClass("bill").addClass("billClicked");
        setDetailsKey(key);
        $.mobile.changePage("details.html", {
          showLoadMsg: true
        });
        return false;
      });
      payTo = bill.payto[1];
      if (payTo.length >= 20) payTo = payTo.substr(0, 20) + "…";
      payAmount = "$" + bill.amount[1];
      payDate = "(" + bill.payon[1] + ")";
      makeLink.html(payTo + " " + payAmount + " " + payDate);
      return i++;
    });
  };

  createListWithXMLData = function(data) {
    var bills, i;
    bills = $(data).find('bill');
    i = 1;
    return _.each(bills, function(bill) {
      var OPERATOR, account, accountMatch, key, makeArrowIcon, makeLink, makeListItem, makeThumbIcon, payAmount, payDate, payTo;
      key = $(bill).find("id").text();
      makeListItem = $("<li>");
      makeListItem.attr("id", "li-key-" + key);
      makeThumbIcon = $("<img>");
      makeThumbIcon.attr("class", "listThumbIcons");
      OPERATOR = /((Checking)|(Savings)|(Credit\sCard))+/g;
      account = $(bill).find("account").text();
      accountMatch = account.match(OPERATOR);
      switch (accountMatch[0]) {
        case "Checking":
          makeThumbIcon.attr("src", "i/checking_thumb.png");
          break;
        case "Savings":
          makeThumbIcon.attr("src", "i/savings_thumb.png");
          break;
        case "Credit Card":
          makeThumbIcon.attr("src", "i/credit_thumb.png");
          break;
        default:
          makeThumbIcon.attr("src", "i/checking_thumb.png");
      }
      makeArrowIcon = $("<img>");
      makeArrowIcon.attr("src", "i/arrow.png");
      makeArrowIcon.attr("class", "listArrowIcons");
      if (_.size(bills) === i) {
        makeListItem.attr("class", "lastBill");
      } else {
        makeListItem.attr("class", "bill");
      }
      makeLink = $("<a>");
      makeLink.attr("href", "#");
      makeListItem.append(makeLink);
      makeListItem.append(makeThumbIcon);
      makeListItem.append(makeArrowIcon);
      $("#homeItems").append(makeListItem);
      $("#li-key-" + key).click("click", function(e) {
        stopEvent(e);
        $(this).removeClass("bill").addClass("billClicked");
        setDetailsKey(key);
        $.mobile.changePage("details.html", {
          showLoadMsg: true
        });
        return false;
      });
      payTo = $(bill).find("payto").text();
      if (payTo.length >= 20) payTo = payTo.substr(0, 20) + "…";
      payAmount = "$" + $(bill).find("amount").text();
      payDate = "(" + $(bill).find("payon").text() + ")";
      makeLink.html(payTo + " " + payAmount + " " + payDate);
      return i++;
    });
  };

  createListWithCSVData = function(data) {
    var bills, i;
    bills = csvToArray(data);
    i = 1;
    return _.each(bills, function(bill) {
      var key;
      key = "";
      _.find(bill, function(details) {
        var OPERATOR, account, accountMatch, makeArrowIcon, makeLink, makeListItem, makeThumbIcon, payAmount, payDate, payTo;
        key = details[1];
        makeListItem = $("<li>");
        makeListItem.attr("id", "li-key-" + key);
        makeThumbIcon = $("<img>");
        makeThumbIcon.attr("class", "listThumbIcons");
        OPERATOR = /((Checking)|(Savings)|(Credit\sCard))+/g;
        account = details[9];
        accountMatch = account.match(OPERATOR);
        switch (accountMatch) {
          case "Checking":
            makeThumbIcon.attr("src", "i/checking_thumb.png");
            break;
          case "Savings":
            makeThumbIcon.attr("src", "i/savings_thumb.png");
            break;
          case "Credit Card":
            makeThumbIcon.attr("src", "i/credit_thumb.png");
            break;
          default:
            makeThumbIcon.attr("src", "i/checking_thumb.png");
        }
        makeArrowIcon = $("<img>");
        makeArrowIcon.attr("src", "i/arrow.png");
        makeArrowIcon.attr("class", "listArrowIcons");
        if (_.size(bills) === i) {
          makeListItem.attr("class", "lastBill");
        } else {
          makeListItem.attr("class", "bill");
        }
        makeLink = $("<a>");
        makeLink.attr("href", "#");
        makeListItem.append(makeLink);
        makeListItem.append(makeThumbIcon);
        makeListItem.append(makeArrowIcon);
        $("#homeItems").append(makeListItem);
        $("#li-key-" + key).click("click", function(e) {
          stopEvent(e);
          $(this).removeClass("bill").addClass("billClicked");
          setDetailsKey(key);
          $.mobile.changePage("details.html", {
            showLoadMsg: true
          });
          return false;
        });
        payTo = details[5];
        if (payTo.length >= 20) payTo = payTo.substr(0, 20) + "…";
        payAmount = "$" + details[7];
        payDate = "(" + details[11] + ")";
        return makeLink.html(payTo + " " + payAmount + " " + payDate);
      });
      return i++;
    });
  };

  setupStaticBills = function(data) {
    var billsList, callbackFunc;
    billsList = [];
    _.each(data, function(value, key) {
      var billObj;
      billObj = value;
      billObj.key = key;
      return billsList.push(billObj);
    });
    callbackFunc = function(a, b) {
      if (a.payon[1] === b.payon[1]) {
        if (a.payon[1] === b.payon[1]) return 0;
        return (a.payon[1] < b.payon[1] ? -1 : 1);
      }
      if (a.payon[1] < b.payon[1]) {
        return -1;
      } else {
        return 1;
      }
    };
    return billsList.sort(callbackFunc);
  };

  /***********************************************************
  # JSON
  **********************************************************
  */

  $("#displayJson").live("click", function(e) {
    stopEvent(e);
    if (getViewState()) {
      setInvalidated(true);
      _this.displayStaticData(false, true, null, "json");
      $("#displayJson").text("Load JSON");
      return $("#displayJson").css("padding", "0.65em 15px 0.6em 15px");
    } else {
      return loadJson();
    }
  });

  loadJson = function() {
    var _this = this;
    return $.ajax({
      url: "data/data.json",
      dataType: "json",
      success: function(json) {
        _this.displayStaticData(true, false, json, "json");
        $("#displayJson").text("Show Home");
        return $("#displayJson").css("padding", "0.65em 15px 0.6em 15px");
      },
      error: function(error) {
        return alert("ERROR: " + error);
      }
    });
  };

  /***********************************************************
  # XML
  **********************************************************
  */

  $("#displayXML").live("click", function(e) {
    stopEvent(e);
    if (getViewState()) {
      setInvalidated(true);
      _this.displayStaticData(false, true, null, "xml");
      $("#displayXML").text("Load XML");
      return $("#displayXML").css("padding", "0.65em 15px 0.6em 15px");
    } else {
      return loadXML();
    }
  });

  loadXML = function() {
    var _this = this;
    return $.ajax({
      url: "data/data.xml",
      dataType: "xml",
      success: function(xml) {
        _this.displayStaticData(true, false, xml, "xml");
        $("#displayXML").text("Show Home");
        return $("#displayXML").css("padding", "0.65em 15px 0.6em 15px");
      },
      error: function(error) {
        return alert("ERROR: " + error.statusText);
      }
    });
  };

  /***********************************************************
  # CSV
  **********************************************************
  */

  $("#displayCSV").live("click", function(e) {
    stopEvent(e);
    if (getViewState()) {
      setInvalidated(true);
      _this.displayStaticData(false, true, null, "csv");
      $("#displayCSV").text("Load CSV");
      return $("#displayCSV").css("padding", "0.65em 15px 0.6em 15px");
    } else {
      return loadCSV();
    }
  });

  loadCSV = function() {
    var _this = this;
    return $.ajax({
      url: "data/data.csv",
      dataType: "text",
      success: function(csv) {
        _this.displayStaticData(true, false, csv, "csv");
        $("#displayCSV").text("Show Home");
        return $("#displayCSV").css("padding", "0.65em 15px 0.6em 15px");
      },
      error: function(error) {
        return alert("ERROR: " + error.statusText);
      }
    });
  };

  csvToArray = function(strData, strDelimiter) {
    var arrData, lines, quote_regexp;
    strDelimiter = strDelimiter || ",";
    quote_regexp = new RegExp("^\"(.*)\"$");
    arrData = [];
    lines = strData.split(new RegExp("\r?[\r\n]"));
    _.each(lines, function(value, key) {
      return arrData.push({
        key: value.split(strDelimiter)
      });
    });
    return arrData;
  };

  this.displayStaticData = function(showBills, showHome, data, type) {
    var bills, form;
    bills = (showBills !== null || showBills !== "" ? showBills : false);
    form = (showHome !== null || showHome !== "" ? showHome : false);
    if (form) {
      switch (type) {
        case "json":
          _this.showHomeJson();
          break;
        case "xml":
          _this.showHomeXML();
          break;
        case "csv":
          _this.showHomeCSV();
      }
    } else if (bills) {
      _this.showStaticBills(data, type);
    } else if (getViewState()) {
      switch (type) {
        case "json":
          _this.showHomeJson();
          break;
        case "xml":
          _this.showHomeXML();
          break;
        case "csv":
          _this.showHomeCSV();
      }
    } else {
      _this.showStaticBills(data, type);
    }
  };

  this.showStaticBills = function(data, type) {
    setViewState(true);
    hideHome();
    viewStaticItems();
    if (getDataDisplayed() === false || getInvalidated()) {
      destroyStaticDataSet();
      getStaticData(data, type);
      setDataDisplayed(true);
      setInvalidated(false);
    }
  };

  this.showHomeJson = function() {
    setViewState(false);
    hideStaticItems();
    viewHome();
    $("#displayData").text("Load Json");
    $("#displayData").css("padding", "0.65em 15px 0.6em 15px");
  };

  this.showHomeXML = function() {
    setViewState(false);
    hideStaticItems();
    viewHome();
    $("#displayData").text("Load XML");
    $("#displayData").css("padding", "0.65em 15px 0.6em 15px");
  };

  this.showHomeCSV = function() {
    setViewState(false);
    hideStaticItems();
    viewHome();
    $("#displayData").text("Load CSV");
    $("#displayData").css("padding", "0.65em 15px 0.6em 15px");
  };

  destroyStaticDataSet = function() {
    return $("#homeItems").empty();
  };

  viewHome = function() {
    $("#unoslider").css("display", "inline");
    $("#grid").css("display", "inline-block");
  };

  hideHome = function() {
    $("#unoslider").css("display", "none");
    $("#grid").css("display", "none");
  };

  viewStaticItems = function() {
    $("#homeItemsSection").css("display", "inline-block");
  };

  hideStaticItems = function() {
    $("#homeItemsSection").css("display", "none");
  };

}).call(this);
