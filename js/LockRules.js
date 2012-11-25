(function( $ ){
    
    var defaultSeparator = /\b\s+/;
    var defaultLockProperty = "lockWord";
    var defaultAllow = true;
    
    var lockTypes = {
        bidirectionalLock:  "BIDIRECTIONAL",
        directLock:  "DIRECT",
        invertLock: "INVERT"
    }
    
    var defaultLockType = lockTypes.bidirectionalLock;
       
    var checkModeTypes = {
        cascade: "CASCADE",
        firstMach: "FIRST_MATCH",
        firstAllow: "FIRST_ALLOW",
        firstDenny: "FIRST_DENY"
    }
    
    var defaultCheckMode = checkModeTypes.cascade;
    
    var lockModeTypes = {
        checkMode: "CHECK_MODE",
        exclusiveMode: "EXCLUSIVE_MODE",
        forceMode: "FORCE_MODE"
    }
    
    var defaultLockMode = lockModeTypes.checkMode;
    
    var defaultLockSettings = {
        lockWord: null,
        lockProperty: defaultLockProperty,
        separator: defaultSeparator, 
        lockRules: []
    };
    
    var currentLocks = [];
        
    function createLockChain(chain, lockSettings) {        
        return $.extend(
        {
            allow: defaultAllow,
            lockProperty: defaultLockProperty,
            separator: defaultSeparator,
            lockType: defaultLockType,
            checkMode: defaultCheckMode,            
            chain: []
        },
        {            
            lockProperty: lockSettings.lockProperty,
            separator: lockSettings.separator,
            lockType: lockSettings.lockType,
            checkMode: lockSettings.checkMode,            
            chain: chain
        }
        );
    }
    
    
    function sanitizeLockRules(lockSettings) {
        var newChain = [];
        //lockSettings = $.extend({}, {lockRules:[]}, lockSettings);        
        if ($.type(lockSettings.lockRules) === "object") { 
            if (lockSettings.lockRules.hasOwnProperty("chain")) {
                lockSettings.lockRules = [createLockChain(lockSettings.lockRules.chain, lockSettings)];
            } else {
                lockSettings.lockRules = [[lockSettings.lockRules]];
            }
        }
        
        var i = 0;
        
        while (i < lockSettings.lockRules.length) {
            var chain = lockSettings.lockRules[i];            
            if ($.type(chain) === "undefined") {
                lockSettings.lockRules.splice(i, 1);
            } else if ($.isArray(chain)) {            
                lockSettings.lockRules[i] = createLockChain(chain, lockSettings);
                i++;      
            } else if ($.type(chain) === "object" && chain.hasOwnProperty("chain") === false) {                
                newChain.push(chain); 
                lockSettings.lockRules.splice(i, 1);
            } else {                                
                if ($.type(chain.allow) === "undefined" ) {
                    chain.allow = defaultAllow;
                }
                        
                if ($.type(chain.lockProperty) === "undefined") {
                    chain.lockProperty = lockSettings.lockProperty;
                }
                
                if ($.type(chain.separator) === "undefined") {
                    chain.separator = lockSettings.separator;
                }
                
                if ($.type(chain.lockType) === "undefined") {
                    chain.lockType = defaultLockType;
                }
                
                if ($.type(chain.checkMode) === "undefined") {
                    chain.checkMode = defaultCheckMode;
                }
                
                i++;
            }
        }
        
        if (newChain.length >= 1) {
            lockSettings.lockRules.push(createLockChain(newChain, lockSettings));
        }
        
        $.each(lockSettings.lockRules,
            function (i, chain) {
                $.each(chain.chain,
                    function (j, rule) {                        
                        if ($.type(rule.allow) === "undefined" ) {
                            rule.allow = chain.allow;
                        }
                        
                        if ($.type(rule.lockProperty) === "undefined") {
                            rule.lockProperty = chain.lockProperty;
                        }
                        
                        if ($.type(rule.separator) === "undefined") {                            
                            rule.separator = chain.separator;
                        }
                        
                        if ($.type(rule.lockType) === "undefined") {                            
                            rule.lockType = chain.lockType;
                        }
                    }
                
                    );
            }
            );
    }
    
    function checkLockRules(lockOptions) {  
        var allow = !currentLocks.some (
            function (lock) {
                return lock.lockMode === lockModeTypes.exclusiveMode;
            }
            );
        if (allow) {
            switch (lockOptions.lockMode) {
                case lockModeTypes.forceMode:
                    allow = true;
                    break;
                case lockModeTypes.exclusiveMode:
                    allow = currentLocks.length === 0;
                    break;
                default:
                    return !currentLocks.some(
                        function (lock, index) {
                            var isAllowed = defaultAllow;
                            var chains = lock.lockRules;
                            //Check Direct Locks
                            if ($.isArray(chains) && chains.length > 0) {
                                if (lock.permissiveMode === true) {
                                    isAllowed =  chains.some (
                                        function (chain) {
                                            return checkLock (chain, lockOptions, lockTypes.directLock);
                                        }
                                        )
                                } else {
                                    isAllowed =  chains.every (
                                        function (chain) {
                                            return checkLock (chain, lockOptions, lockTypes.directLock);
                                        }
                                        )
                                }
                            }
                
                            //Check Invert Locks
                            if (isAllowed && $.isArray(lockOptions.lockRules) && lockOptions.lockRules.length > 0) {
                    
                                if (lockOptions.permissiveMode === true) {
                                    isAllowed =  lockOptions.lockRules.some (
                                        function (chain) {
                                            return checkLock (chain, lock, lockTypes.invertLock);
                                        }
                                        )
                                } else {
                                    isAllowed =  lockOptions.lockRules.every (
                                        function (chain) {
                                            return checkLock (chain, lock, lockTypes.invertLock);
                                        }
                                        )
                                }
                            }
                
                            return !isAllowed;
                        }
                        );
            }
        }
        return allow;
    }
    
    function checkLock (chain, lock, lockType) {
        var allowed = defaultAllow;
        for (var i = 0; i< chain.chain.length; i++) {
            var rule = chain.chain[i];
            var matchRegExp = null;
            var matchSelector = null;
            
            if (rule.lockType === lockTypes.bidirectionalLock || rule.lockType === lockType) {
                
                //Check RegexpLock
                if (rule.hasOwnProperty("regExpLock")) {                    
                    if (lock.hasOwnProperty(rule.lockProperty) && lock[rule.lockProperty] != null) {                        
                        var propertyValue = lock[rule.lockProperty];                        
                        var words = propertyValue.split(rule.separator);
                        matchRegExp = words.some(
                            function(word) {                                                            
                                return word.match(rule.regExpLock) !== null;
                            }
                            );                        
                    } else {
                        matchRegExp = false;
                    }
                }
                
                //Check SelectorLock
                if (rule.hasOwnProperty("selectorLock")) {                        
                    if (lock.hasOwnProperty("selectorThis")) {
                        matchSelector = $(rule.selectorLock).filter(lock.selectorThis).size() > 0;
                    } else {
                        matchSelector = false;
                    }
                }
                    
                if (matchRegExp === true && matchSelector === true ||
                    matchRegExp === null && matchSelector === true || 
                    matchRegExp === true && matchSelector === null ||
                    matchRegExp === null && matchSelector === null && rule.hasOwnProperty("allow")
                    ) {
                   
//                   console.log("______________________________");
//                    console.log("*** FOUND MATCH ***");
//                    console.log("rule=" + JSON.stringify(rule));
//                    console.log("lock=" + JSON.stringify(lock));                    
//                    console.log("matchRegExp= " + matchRegExp + " matchSelector=" + matchSelector+ " rule.allow=" + rule.allow + " lockType=" + lockType);                    
//                    console.log("*** END MATCH ***");
//                    console.log("______________________________");
                    
                    allowed = rule.allow === true;
                    
                    if (chain.checkMode === checkModeTypes.firstMach || (chain.checkMode === checkModeTypes.firstAllow && rule.allow === true) || (chain.checkMode === checkModeTypes.firstDenny && rule.allow === false) ) {
                        break;
                    }
                    
                }
            //alert(JSON.stringify(rule));
            //alert(JSON.stringify(lock));
            }
        }
        return allowed;
    }
    
    var methods = {        
        
        init: function () {            
            currentLocks = [];            
        },
        
        sanitizeLock: function(lockOptions) {
            var lockSettings = $.extend({}, defaultLockSettings, lockOptions);              
            sanitizeLockRules(lockSettings);
            return lockSettings;
        },
        
        checkLock : function(lockOptions) {             
            return checkLockRules(methods.sanitizeLock(lockOptions));
        },
        
        addLock : function(lock, avoidCheck) {             
            var checked = false;
            if (avoidCheck === true) {
                checked = true;
            } else {
                checked = methods.checkLock(lock);
            }
            if (checked) {
                lock.key = Math.floor(Math.random()*10e10) + "-" + ((new Date()).getTime()).toString();
                currentLocks.push(methods.sanitizeLock(lock));
            }
            if (checked) {
                return lock;
            } else {
                return false;
            }
        },
        
        removeLock : function(lock) { 
            var key;
            if ($.type(lock) === "object" && lock.hasOwnProperty("key")) {
                key = lock.key;
            } else {
                key = lock;
            }
            var i = 0;
            var found = false;            
            while (i < currentLocks.length && !found) {
                if (key === currentLocks[i].key) {
                    found = true;
                } else {
                    i++;
                }
            }
            if (found) {
                currentLocks.splice(i, 1);
            }
            return found;
        },
        
        locksSize: function( ) {            
            return currentLocks.length;  
        },
        
        getCurrentLocks: function( ) {            
            return currentLocks;  
        },
        
        getLockType: function (type) {
            if (lockTypes.hasOwnProperty(type)) {
                return lockTypes[type];
            } else {
                return defaultLockType;
            }
        },
        
        getCheckModeType: function (type) {
            if (checkModeTypes.hasOwnProperty(type)) {
                return checkModeTypes[type];
            } else {
                return defaultCheckMode;
            }
        },
        
        getLockModeType: function (type) {
            if (lockModeTypes.hasOwnProperty(type)) {
                return lockModeTypes[type];
            } else {
                return defaultLockMode;
            }
        }
        
        
    };

    $.lockRules = function( method ) {   
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }    
  
    };
})( jQuery );