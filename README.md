# MongoDB Async Iterator

Just some helper utilities for iterating through mongodb collections in node.
mirrors some functions from async.js which is a dependency


## Quick Examples

```javascript
var mongoAsyncIterator = require('mongo-async-iterator');
var cursor = mongo_collection.find({ .. query .. }});

mongoAsyncIterator.eachSeries(cursor, function(doc, cb) {
  // perform async processing, call cb() when done.
  // if an error occurs and cb(err) is called, the final
  // callback will be called and no other processing functions will run
}, function(err) {
  // final callback, err will be set if cb(err) was called
});

mongoAsyncIterator.parallelLimit(cursor, 10, function(doc, cb) {
  // perform async processing, call cb() when done.
  // there will be up to 10 concurrently running at a time.
  // the final callback will be called immediately if cb(err) is calledeachSeries
}, function(err) {
  // final callback, err will be set if cb(err) was called
  // if an error occurs
});
```

