(function($) {
  "use strict";

  var Kaster = {
    init: function(applicationID, el) {
      var sessionRequest = new chrome.cast.SessionRequest(applicationID);

      Kaster.NS = APP_NS;
      
      _.bindAll(this);

      this.config = new chrome.cast.ApiConfig(
        sessionRequest,
        this.onSession,
        this.onReceive);
        
      chrome.cast.initialize(
        this.config, 
        this.onInitSuccess, 
        this.onInitError);

      this.el = el;
      this.$el = $(el);
      this.initialized = true;

      this.el.className = "kaster kaster-started";
    },
    
    onSession: function(session) {
      console.log('onSession');
      this.session = session;

      this.el.className= "kaster kaster-session";
    },
    
    onReceive: function(e) {
      console.log('onReceive', e);
      this.el.className = "kaster kaster-receive";
      this.el.addEventListener('click', this.onSessionRequest);
    },
    
    onInitSuccess: function() {
      this.el.className = "kaster kaster-initialized"
      console.log('onInitSuccess');
    },
    
    onInitError: function() {
      this.el.clasName = "kaster kaster-error";
      console.error('onInitEerror');
    },
    
    onSessionRequest: function() {
      this.el.className = "kaster kaster-requesting-session";
      chrome.cast.requestSession(
        this.onRequestSessionSuccess, 
        this.onLaunchError);
    },
    
    onRequestSessionSuccess: function(session) {
      this.session = session;
      this.el.className = "kaster kaster-has-session";
      this.el.innerHTML = "casting...";
      console.log('onRequestSessionSuccess');
    },
    
    onLaunchError: function(e) {
      this.el.className = "kaster-launch-error";
      console.error(e);
    }
  };

  window.KasterApp = function(AppId, el) {
    if(typeof $ === 'undefined') {
      throw new Error("jQuery must be loaded on document for Kaster to work");
    }
    
    if (Kaster.initialized) {
      throw new Error("A Kaster app is already running");
    } else {
      window.__onGCastApiAvailable = Kaster.init.bind(Kaster, AppId, el)
    }
  };

  KasterApp.prototype.send = function(command) {
    var defer = $.Deferred();
    var args = [].slice.call(arguments, 1);

    var message = {
      command: command, 
      args: args
    };

    Kaster.session.sendMessage(
      Kaster.NS, 
      message,
      defer.resolve,
      defer.reject);

    return defer.promise();
  }
  
})(window.jQuery);

(function() {
	var appConfig, appController, customMessageBus;

	appController = {
		_commands: {},

		registerCommand: function(name, command) {
			this._commands[name] = command;
		},

		command: function(name) {
			return this._commands[name] || function() {};
		},

		onMessage: function(event) {
			var data = JSON.parse(event.data);

			appController.command(data.command)
				.apply(appController, data.args);
		}
	};

	function Receiver(ns) {
		window.castReceiverManager = cast.receiver
			.CastReceiverManager
			.getInstance();

		appConfig = new cast.receiver.CastReceiverManager.Config();

		appConfig.statusText = "Readt to play";
		appConfig.maxInactivity = 30000;

		customMessageBus = castReceiverManager.getCastMessageBus(APP_NS);

		customMessageBus.onMessage = appController.onMessage;
		window.castReceiverManager.start(appConfig);

		return appController;
	}

	window.KasterApp.Receiver = Receiver;
})();