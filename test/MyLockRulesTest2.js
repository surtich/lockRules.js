
module("Check Locks", {
    setup: function () {        
        $.lockRules('init'); 
    }
}
);

test( "Check Empty Lock", function() {
    var lock = {};    
    $.lockRules('addLock', lock); 
    ok($.lockRules('locksSize')===1, "Check add lock" );    
    ok($.lockRules('getCurrentLocks')[0].hasOwnProperty("key")===true, "Check add lock" );    
    $.lockRules('init'); 
    ok($.lockRules('locksSize')===0, "Check init lock" );    
});


test( "Check Simple Locks", function() {
    var lock = {
        lockRules: {
            allow: false
        }
    };   
    $.lockRules('addLock', lock); 
    
    ok($.lockRules('checkLock', {}) === false, "Check denny all lock");
    $.lockRules('init'); 
    lock = {
        lockRules: {
            allow: true
        }
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === true, "Check accept all lock");
    
    $.lockRules('init');         
    var lock2 = {
        lockRules: {
            allow: false
        }
    };
    $.lockRules('addLock', lock2);     
    ok($.lockRules('checkLock', {}) === false, "One lock denny all");
    
    $.lockRules('init');
    lock = {
        lockRules: [
        {
            allow: false
        },

        {
            allow: true
        }
        ]
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === true, "Test chain lock: First denny all then accept all");
    
    $.lockRules('init');
    lock = {
        lockRules: [
        {
            allow: true
        },

        {
            allow: false
        }
        ]
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === false, "Test chain lock: First accept all then denny all");
    
    $.lockRules('init');
    lock = {};
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === true, "Test default policy is no lock");
});


test( "Check Chain RegExp Locks", function() {
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [{                
                allow: false,
                regExpLock: /login/
            },
            {
                allow: true,
                regExpLock: /gin2/
            }]
        }
        ]
    };    
    
    $.lockRules('addLock', lock); 
    
    ok($.lockRules('checkLock', {}) === true, "Check No match lock");
    
    ok($.lockRules('checkLock', {
        lockWord: "login2"
    }) === true, "Check Regexp Mach: First denny, then accept");
    
    ok($.lockRules('checkLock', {
        lockWord: "login3"
    }) === false, "Check Regexp Mach: First denny, then no match");
    
    ok($.lockRules('checkLock', {
        lockWord: "LOgin2"
    }) === true, "Check Regexp Mach: First no match, then accept");
    
    ok($.lockRules('checkLock', {
        lockWord: "buy"
    }) === true, "Check No Regexp Mach");
    
    $.lockRules('init');
    
    lock = 
    {
        lockRules: [
        
        {            
            chain: [{                
                allow: true,
                regExpLock: /gin2/
                
            },
            {
                allow: false,
                regExpLock: /login/
            }]
        }
        ]
    };    
    $.lockRules('addLock', lock); 
    
    ok($.lockRules('checkLock', {}) === true, "Check No match lock");
    
    ok($.lockRules('checkLock', {
        lockWord: "login2"
    }) === false, "Check Regexp Mach: First accept, then denny");
    
    ok($.lockRules('checkLock', {
        lockWord: "login3"
    }) === false, "Check Regexp Mach: First no match, then denny");
    
    ok($.lockRules('checkLock', {
        lockWord: "LOgin2"
    }) === true, "Check Regexp Mach: First accept, then no match");
    
    ok($.lockRules('checkLock', {
        lockWord: "buy"
    }) === true, "Check No Regexp Mach");
    
});


test( "Check 2 Chain RegExp Locks", function() {
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [{                
                allow: false,
                regExpLock: /login/
            },
            {
                allow: true,
                regExpLock: /login2/
            }]
        },
        {
            allow: false
        }
        ]
    };    
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === false, "Check No match lock");
    $.lockRules('init');    
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [{                
                allow: false,
                regExpLock: /login/
            },
            {
                allow: true,
                regExpLock: /login2/
            }]
        },
        {
            allow: false
        }
        ]
    };    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {
        lockWord: "login2"
    }) === false, "Check match lock");
    $.lockRules('init');    
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [{                
                allow: false,
                regExpLock: /login/
            },
            {
                allow: true,
                regExpLock: /login2/
            }]
        },
        {
            allow: false,
            regExpLock: /login22/
        }
        ]
    };    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {
        lockWord: "buy"
    }) === true, "Check no match lock");
    ok($.lockRules('checkLock', {
        lockWord: "login"
    }) === false, "Check match lock");
    ok($.lockRules('checkLock', {
        lockWord: "login2"
    }) === true, "Check match lock");
    ok($.lockRules('checkLock', {
        lockWord: "login222"
    }) === false, "Check match lock");
//alert(JSON.stringify($.lockRules('getCurrentLocks')[0]));
    
});


test( "Check Selector Locks", function() {
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [
            {                
                allow: false,
                selectorLock: "div"
            },
            {                
                allow: false,
                selectorLock: "#qunit"
            }
            ]
        }
        ]
    };    
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {
        selectorThis:"div"
    }) === false, "Check trivial match lock");
    ok($.lockRules('checkLock', {
        selectorThis:"#qunit"
    }) === false, "Check trivial match lock");
    
//alert(JSON.stringify($.lockRules('getCurrentLocks')[0]));
    
});


test( "Check RegExp and Selector Locks both", function() {
    var lock = 
    {
        lockRules: [
        
        {            
            chain: [
            {                
                allow: false,
                regExpLock: /login/
            },
            {                
                allow: false,
                selectorLock: "#qunit"
            }
            ]
        }
        ]
    };    
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {}) === true, "Check no match lock");
    ok($.lockRules('checkLock', {
        lockWord:"buy"
    }) === true, "Check no match lock");
    ok($.lockRules('checkLock', {
        lockWord:"buy", 
        selectorThis:"p"
    }) === true, "Check no match lock");
    ok($.lockRules('checkLock', {
        lockWord:"buy", 
        selectorThis:"div"
    }) === false, "Check match lock");
    $.lockRules('init'); 
    lock = 
    {
        lockRules: [
        
        {            
            chain: [
            {                
                allow: false,
                regExpLock: /login/
            },
            {                
                allow: true,
                selectorLock: "#qunit"
            }
            ]
        }
        ]
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {
        lockWord:"login", 
        selectorThis:"div"
    }) === true, "Check match lock");
    
    $.lockRules('init'); 
    lock = 
    {
        lockRules: [
        
        {            
            chain: [
            {                
                allow: true,
                selectorLock: "#qunit"
                
            },
            {                
                allow: false,
                regExpLock: /login/
            }
            ]
        }
        ]
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {
        lockWord:"login", 
        selectorThis:"div"
    }) === false, "Check match lock");
    
    $.lockRules('init'); 
    lock = 
    {
        lockRules:        
        {          
            allow: false,
            selectorLock: "#qunit",
            regExpLock: /login/
        }          
    }
        
    ;
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {        
        lockWord:"login"
    }) === true, "Check match lock");
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {        
        selectorThis:"div"
    }) === true, "Check match lock");
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', {        
        selectorThis:"div",
        lockWord:"login"
    }) === false, "Check match lock");
//alert(JSON.stringify($.lockRules('getCurrentLocks')[0]));
    
});


test( "Check Inverts Locks", function() {
    var lock = 
    {
    }; 
    
    var lock2 = {
        lockRules: {
            allow: false
        }
    }
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial match invert lock");
    
    lock2 = {
        lockRules: {
            allow: false,
            regExpLock: /login/
        }
    }
    
    ok($.lockRules('checkLock', lock2) === true, "Check trivial no match invert lock");
    $.lockRules('init'); 
    $.lockRules('addLock', {
        lockWord:"login"
    });     
    
    lock2 = {
        lockRules: {
            allow: false,
            regExpLock: /log/
        }
    }
    
    ok($.lockRules('checkLock', lock2) === false, "Check trivial match invert lock");
    
    $.lockRules('init'); 
    $.lockRules('addLock', {
        lockWord:"log"
    });     
    
    lock2 = {
        lockRules: {
            allow: false,
            regExpLock: /login/
        }
    }
    
    ok($.lockRules('checkLock', lock2) === true, "Check non trivial match invert lock");
    
//alert(JSON.stringify($.lockRules('sanitizeLock', lock2)));
    
});


test( "Check Bidirectional Locks", function() {
    var lock = 
    {
        lockRules: {
            allow: true
        }
    }; 
    
    var lock2 = {
        lockRules: {
            allow: false
        }
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial match bidirectional lock");
    
    $.lockRules('init');     
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check trivial match bidirectional lock");
    
    
    lock = 
    {
        selectorThis: "div",
        lockRules: {
            allow: true
            
        }
    }; 
    
    lock2 = {
        lockRules: {
            allow: false,
            selectorLock: "div"
        }
    };
    
    $.lockRules('init');     
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check trivial match bidirectional lock");
    
    $.lockRules('init');     
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial match bidirectional lock");
    
    
});

