
module("Sanitize Settings");

test( "lockWord Tests", function() {
    var lock = $.lockRules('sanitizeLock');    
    ok( lock.lockWord === null, "Check empty object lock" );
    
    lock = $.lockRules('sanitizeLock',{
        lockWord:"login"
    });
    ok( lock.lockWord === "login", "Check lockWord");
    
});

test( "Empty lockRules Tests", function() {
    var lock = $.lockRules('sanitizeLock');    
    ok( $.isArray(lock.lockRules) === true, "Check empty lockRules" );    
    
    lock = $.lockRules('sanitizeLock',{
        lockRules:[]
    });    
    ok( $.isArray(lock.lockRules) === true, "Check empty lockRules array");    
    
    lock = $.lockRules('sanitizeLock',{
        lockRules:{
            chain:[]
        }
    });
    
    ok( lock.lockRules[0].allow === true, "Check unique chain object");    
    
    
    lock = $.lockRules('sanitizeLock',{
        lockRules:{}
    });    
    ok( $.isArray(lock.lockRules) === true, "Check if empty lockRules object is converted to array");    
    ok( $.isArray(lock.lockRules[0].chain) === true, "Check if there is a chain array");    
    
    
});

test( "Real lockRules Tests", function() {
    var lock = $.lockRules('sanitizeLock',
    {
        lockRules: {
            allow: true,
            regExpLock: /^[0-9]/
        }
    }
    );    
        

    ok( lock.lockRules[0].allow === true, "Check unique rule" );    
    ok( lock.lockRules[0].chain[0].hasOwnProperty("regExpLock") === true, "Check unique rule" );    
    
    lock = $.lockRules('sanitizeLock',
    {
        lockRules: [
        {
            allow: true,
            regExpLock: /^[0-9]/
        },
        {
            allow: false,
            selectorLock: "div"
        }
        ]
    }
    ); 
    

    ok(lock.lockRules[0].chain[1].hasOwnProperty("selectorLock") === true, "Check one rules array chain" );    

    lock = $.lockRules('sanitizeLock',
    {
        lockRules: [
        [{
            allow: true,
            regExpLock: /^[0-9]/
        },
        {
            allow: false,
            selectorLock: "div"
        }],
        [
        {
                
        }
        ]
        ]
    }
    ); 
        
    ok(lock.lockRules[1].chain[0].hasOwnProperty("allow") === true, "Check multiple rules array chain" );    
        
    lock = $.lockRules('sanitizeLock',
    {
        lockRules: [
        
        {
            chain: [{
                allow: true,
                regExpLock: /^[0-9]/
            },
            {
                allow: false,
                selectorLock: "div"
            }]
            },
        

            {
            chain: [

            {
                
            }
            ]
            }
        ]
    }
    ); 
    ok(lock.lockRules[0].allow === true, "Check multiple rules object chain");
    ok(lock.lockRules[0].chain[0].hasOwnProperty("lockProperty") === true, "Check multiple rules object chain" );    
    
    lock = $.lockRules('sanitizeLock',
    {
        lockRules: [
        
        [{
                allow: true,
                regExpLock: /^[0-9]/
            },
            {
                allow: false,
                selectorLock: "div"
            }]
            ,
            {
                allow:false,
                selectorLock: "[type='submit']"
            },
        

            {
            chain: [

            {
                regExpLock: new RegExp("^$")
            }
            ]
            },
            
            {
                allow:false,
                selectorLock: "[type='hidden']"
            }
        ]
    }
    );
    ok(lock.lockRules.length === 3, "Check mix rules object chain" );    
    ok(lock.lockRules[1].chain.length === 1, "Check mix rules object chain" );    
    ok(lock.lockRules[2].chain.length === 2, "Check mix rules object chain" );    
    //alert(JSON.stringify(lock)) ;
});



