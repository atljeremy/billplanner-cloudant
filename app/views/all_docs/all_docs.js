function(doc) {
  if (doc.account-bank) {
    emit(doc);
  }
};