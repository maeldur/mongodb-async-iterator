var async = require('async')

exports.eachSeries = function (cursor, userCallback, userDone) {
  var cursorExhausted = false

  async.whilst(
    // keep going until cursor is exhausted
    function () {
      return !cursorExhausted
    },
    // nextObject is passed to the callback and we wait for our callback
    // to be called before we call nextObject again
    function (cb) {
      cursor.nextObject(function (err, obj) {
        if (err || !obj) {
          cursorExhausted = true
          return cb(err)
        }

        // setImmediate avoids call stack issues when userCallback is fully sync
        setImmediate(function () {
          userCallback(obj, function (err) {
            cb(err)
          })
        })
      })
    },
    // finished with the iteration via error or not, call user's done callback
    function (err) {
      userDone(err)
    }
  )
}

// processes docs in parallel up to limit at a time
exports.parallelLimit = function (cursor, limit, userCallback, userDone) {
  var cursorExhausted = false
  var queue
  var finished = false

  var taskHandler = function (obj, cb) {
    setImmediate(function () {
      if (finished) {
        return cb()
      }
      userCallback(obj, function (err) {
        return cb(err)
      })
    })
  }

  queue = async.queue(taskHandler, limit)
  queue.drain = function () {
    if (cursorExhausted) {
      userDone()
    }
  }

  var handleError = function (err) {
    if (err && !finished) {
      queue.pause()
      queue.kill()
      finished = true
      userDone(err)
    }

  }
  // fill the queue continually
  async.whilst(
    function () {
      return !cursorExhausted
    },
    function (cb) {
      if (queue.length() > limit) {
        setTimeout(function () {
          return cb()
        }, 0)
        return
      }
      cursor.nextObject(function (err, obj) {
        if (err || !obj) {
          cursorExhausted = true
          return cb(err)
        }
        queue.push(obj, handleError)
        return cb()
      })
    },
    function (err) {
      if (err && !finished) {
        finished = true
        userDone(err)
      }
    }
  )
}
