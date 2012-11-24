
module("Check Special Locks", {
    setup: function () {        
        $.lockRules('init'); 
    }
}
);



test( "Check One direction Locks", function() {
    var lock = 
    {
        lockRules: {
            allow: false,
            lockType: $.lockRules('getLockType', 'directLock')
        }
    }; 
    
    var lock2 = {
        lockRules: {
            allow: true
        }
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial match onedirectional lock");
    
    $.lockRules('init');     
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === true, "Check trivial no match onedirectional lock");
    
    lock = 
    {
        lockRules: {
            allow: false,
            lockType: $.lockRules('getLockType', 'invertLock')
        }
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === true, "Check trivial no match onedirectional lock");
    
    $.lockRules('init');     
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check trivial match onedirectional lock");
    
});


test( "Check Permissive Locks", function() {
    
    var lock = 
    {
        lockRules: [
        [
        {
            allow: false
        }
        ],
        [
        {
            allow: true
        }
        ]
            
        ]
        
    }; 
    
    var lock2 = {};
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial non permissive lock");
     
    $.lockRules('init');  
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check trivial non permissive lock");
    
    $.lockRules('init');  
    lock = 
    {
        permissiveMode: true,
        lockRules: [
        [
        {
            allow: false
        }
        ],
        [
        {
            allow: true
        }
        ]
            
        ]
        
    }; 
    
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === true, "Check trivial permissive lock");
    
    $.lockRules('init');  
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === true, "Check trivial permissive lock");
    
    $.lockRules('init');  
    lock = 
    {
        permissiveMode: true,
        lockRules: [
        [
        {
            allow: false
        }
        ]   
        ]
        
    }; 
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check trivial permissive lock");
    $.lockRules('init');  
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check trivial permissive lock");  
});

test( "Check change the lockProperty", function() {
    
    var lock = 
    {
        
        lockRules: 
        {
            regExpLock: /shop/,
            allow: false
        }
        
        
    }; 
    
    var lock2 = {
        url: "buy.php",
        lockWord: "shop"
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check default match lockProperty");     
    
    $.lockRules('init');  
    lock2 = {
        url: "shop.php",
        lockWord: "buy"
    };
    ok($.lockRules('checkLock', lock2) === true, "Check default no match lockProperty");     
    
    $.lockRules('init');  
    lock = 
    {
        lockProperty: "url",
        lockRules: 
        {
            regExpLock: /buy/,
            allow: false
        }
        
        
    }; 
    
    lock2 = {
        url: "buy.php",
        lockWord: "shop"
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check non default match lockProperty");    
    $.lockRules('init');  
    
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check non default match lockProperty");    
    
    $.lockRules('init');  
    lock = 
    {
        lockProperty: "url",
        lockRules: 
        {
            regExpLock: /buy/,
            allow: false
        }
        
    }; 
    
    lock2 = {
        url: "shop.php",
        lockWord: "shop"
    };

    $.lockRules('addLock', lock); 
        
    ok($.lockRules('checkLock', lock2) === true, "Check non default no match lockProperty");
    
    $.lockRules('init');  
    lock = 
    {
        lockProperty: "url2",
        lockRules: 
        {
            regExpLock: /buy/,
            allow: false
        }
        
    }; 
    
    lock2 = {
        url: "buy.php",
        lockWord: "shop"
    };

    $.lockRules('addLock', lock); 
        
    ok($.lockRules('checkLock', lock2) === true, "Check non exists lockProperty");
});


test( "Check separator property", function() {
    
    var lock = 
    {
        
        lockRules: 
        {
            regExpLock: /^shop$/,
            allow: false
        }
        
        
    }; 
    
    var lock2 = {        
        lockWord: "shop buy"
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check default separator property");     
    
    lock2 = {        
        lockWord: "buy shop"
    };
    ok($.lockRules('checkLock', lock2) === false, "Check default separator property");     
    
    lock2 = {        
        lockWord: "buy2 shop2"
    };
    ok($.lockRules('checkLock', lock2) === true, "Check default separator property whith no match");     
    
    $.lockRules('init');  
    
    lock = 
    {
        separator: /,/,
        lockRules: 
        {
            regExpLock: /^shop$/,
            allow: false
        }
    }; 
    $.lockRules('addLock', lock); 
    
    lock2 = {        
        lockWord: "buy shop"
    };
    ok($.lockRules('checkLock', lock2) === true, "Check non default separator property whith no match");     
    
    lock2 = {        
        lockWord: "buy,shop"
    };
    ok($.lockRules('checkLock', lock2) === false, "Check non default separator property whith match");     
});

test( "Check checkMode property", function() {
    
    var lock = 
    {
        
        lockRules: [
        {
            regExpLock: /shop/,
            allow: false
        },
        {            
            allow: true
        }
        ]
        
    }; 
    
    var lock2 = {
        lockWord: "shop"
    };
    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === true, "Check default checkMode property");     
    
    lock = 
    {
        
        lockRules: [        
        {            
            allow: true
        }, {
            regExpLock: /shop/,
            allow: false
        }
        ]
        
    }; 
    $.lockRules('init'); 
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check default checkMode property");         
    $.lockRules('init'); 
    lock = 
    {
        checkMode: $.lockRules('getCheckModeType','firstMach'),
        lockRules: [        
        {            
            allow: true
        }, {
            regExpLock: /shop/,
            allow: false
        }
        ]
        
    }; 
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === true, "Check firstMach checkMode");
    
    $.lockRules('init'); 
    lock = 
    {
        checkMode: $.lockRules('getCheckModeType','firstAllow'),
        lockRules: [        
        {            
            allow: true
        }, {
            regExpLock: /shop/,
            allow: false
        }
        ]
        
    }; 
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === true, "Check firstAllow checkMode");
    
    $.lockRules('init'); 
    lock = 
    {
        checkMode: $.lockRules('getCheckModeType','firstDenny'),
        lockRules: [        
        {
            regExpLock: /shop/,
            allow: false
        },
        {            
            allow: true
        }
        ]
        
    }; 
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check firstDenny checkMode");
    
    //alert(JSON.stringify($.lockRules('getCurrentLocks')[0]));
});

test( "Check LockMode property", function() {
    
    var lock = {
        lockRules: {
            allow: false
        }
    };     
    var lock2 = {};    
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check default lockMode property");     
    
    lock2 = {
        lockMode: $.lockRules('getLockModeType','forceMode')
    };
    
    ok($.lockRules('checkLock', lock2) === true, "Check forceMode value");     
    
    $.lockRules('init'); 
    lock = {
        lockRules: {
            allow: true
        }
    };     
    lock2 = {
        lockMode: $.lockRules('getLockModeType','exclusiveMode')
    };
    $.lockRules('addLock', lock); 
    ok($.lockRules('checkLock', lock2) === false, "Check exclusiveMode value");     
    
    $.lockRules('init'); 
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check exclusiveMode value");
    
    $.lockRules('init'); 
    var lock3 = {
        lockRules: {
            allow: true
        }
    };    
    $.lockRules('addLock', lock2); 
    ok($.lockRules('checkLock', lock) === false, "Check exclusiveMode value");
    
    //alert(JSON.stringify($.lockRules('getCurrentLocks')[0]));
});




