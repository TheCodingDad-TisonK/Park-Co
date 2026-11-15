//@ Park Co, part 60: quieter notices (tison, 2026-11-14: "i don't need to see what rode and how much"). The game said something for
//@ every ticket, every toy and every ride that unloaded, and the corner stacks never stood still. Routine bookkeeping now stays
//@ out of sight (the log in the office keeps it); what stays on screen is what asks for a decision or tells of a fault.
  // ── What is routine ──────────────────────────────────────────────
  // toasts: a sale, a ride's start, the little confirmations of a button press
  var PK_NT_TOAST = /^(Ticket sold|Toy sold|Ice cream sold|Fries sold|Riding |Test run|The station bell rings|Teleported|Use button:|Toy |Ticket window )/i;
  // the feed: how many rode, a ride starting or stopping on its own, the AUTO switch, a dispatch count
  var PK_NT_FEED = /( rode$| started$| stopping$|^Dispatch with |^AUTO (on|off)$|set to (AUTO|MANUAL)$|: test run$|^Test run|^Clocked (in|out)|^Ride lights |: the train is leaving soon$)/i;
  var PK_NT = { last: {}, feedMs: 7000, toastMax: 2 };

  var _pkNtToast = toast, _pkNtLog = logEvent;
  // the same line twice inside three seconds is one line; a routine line is not shown
  toast = function (msg, kind) {
    var m = String(msg == null ? '' : msg);
    if (kind !== 'bad' && PK_NT_TOAST.test(m)) return;
    var now = Date.now(), k = 't:' + m;
    if (PK_NT.last[k] && now - PK_NT.last[k] < 3000) return;
    PK_NT.last[k] = now;
    var r = _pkNtToast.apply(null, arguments);
    var box = document.getElementById('h-toasts'); if (box) while (box.children.length > PK_NT.toastMax) box.removeChild(box.firstChild);
    return r;
  };
  logEvent = function (msg, kind) {
    var m = String(msg == null ? '' : msg);
    var routine = kind !== 'bad' && PK_NT_FEED.test(m);
    var now = Date.now(), k = 'l:' + m;
    if (PK_NT.last[k] && now - PK_NT.last[k] < 3000) return;
    PK_NT.last[k] = now;
    var r = _pkNtLog.apply(null, arguments);   // the office's log keeps every line
    var feed = document.getElementById('h-feed');
    if (feed && feed.lastChild) {
      if (routine) feed.removeChild(feed.lastChild);   // a routine line never reaches the screen
      else { var d = feed.lastChild; while (feed.children.length > 4) feed.removeChild(feed.firstChild); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, PK_NT.feedMs); }
    }
    return r;
  };
