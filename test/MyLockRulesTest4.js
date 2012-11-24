
module("Add/Remove Locks", {
    setup: function () {        
        $.lockRules('init'); 
    }
}
);


test( "Add locks", function() {
    var lock = {
        lockRules: {
            allow: false
        }
    };    
    $.lockRules('addLock', lock); 
    ok($.lockRules('locksSize') === 1, "Check add one lock with check");
    var lock2 = {
        lockRules: {
            allow: false
        }
    };    
    $.lockRules('addLock', lock2); 
    ok($.lockRules('locksSize') === 1, "Check add two locks with check");
    
    var lock3 = {
        lockRules: {
            allow: false
        }
    };    
    $.lockRules('addLock', lock3, true); 
    ok($.lockRules('locksSize') === 2, "Check add three locks without check");
    
});

test( "Remove locks", function() {    
    var lock1 = $.lockRules('addLock', {}); 
    var lock2 = $.lockRules('addLock', {}); 
    ok($.lockRules('locksSize') === 2, "Check add two locks");
    ok($.lockRules('removeLock', lock1) === true, "Check remove lock by lock");
    ok($.lockRules('removeLock', lock1) === false, "Check can't remove lock if non exists");
    ok($.lockRules('removeLock', lock2.key) === true, "Check remove lock by key");
    ok($.lockRules('locksSize') === 0, "Check add three locks without check");
    
});

