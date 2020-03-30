var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Display;
(function (Display) {
    Display["HIDE"] = "none";
    Display["SHOW"] = "block";
})(Display || (Display = {}));
function notify(message, visual) {
    if (window['unlockNotify']) {
        if (visual)
            alert(message);
        else
            console.log(message);
    }
}
function setDisplay(target, display, topTag) {
    for (let next = target.nextElementSibling; next !== null; next = next.nextElementSibling) {
        next.style.display = display;
    }
}
const showContent = (target, topTag = 'section') => {
    setDisplay(target, Display.SHOW, topTag);
};
const hideContent = (target, topTag = 'section') => {
    setDisplay(target, Display.HIDE, topTag);
};
const checkConfig = (configuration) => {
    let errors = {
        locks: { general: [], lock: [] },
        icon: [],
        callToAction: [],
        general: []
    };
    if (!configuration && (window['unlockProtocolConfig'] === null || window['unlockProtocolConfig'] === undefined)) {
        let message = 'Global configuration doesn\'t exists';
        notify(message);
        errors.general.push(message);
        return errors;
    }
    const config = configuration !== undefined && configuration !== null ? configuration : window['unlockProtocolConfig'];
    if (config.locks === undefined || config.locks === null) {
        let message = 'No locks defined, please add some locks!';
        notify(message);
        errors['locks'].general.push(message);
    }
    ;
    if (typeof config.locks == 'object') {
        let message = 'Empty locks, please add some locks!';
        notify(message);
        errors['locks'].general.push(message);
    }
    Object.keys(config.locks).forEach((key) => {
        if (web3 && web3.utils) {
            if (web3.utils.isAddress(key)) {
                let lockConfig = config.locks[key];
                if (lockConfig.name == null || lockConfig.name === 'undefined') {
                    let message = `ERROR: Provide a name for ${key}`;
                    notify(message);
                    errors['locks'].lock.push(message);
                }
            }
            else {
                let message = `INVALID: ${key} is not a valid lock address`;
                notify(message);
                errors['locks'].lock.push(message);
            }
        }
        else
            notify(`Error: ${key} couldn't be validated. Enable web3 please!`);
    });
    if (config.icon === null || config.icon === undefined) {
        let message = 'INVALID: icon url doesn\'t exists, use as ref: `https://staging-app.unlock-protocol.com/static/images/svg/default.svg`';
        notify(message);
        errors['icon'].push(message);
    }
    if (config.callToAction === null || config.callToAction === undefined) {
        let message = 'INVALID: cta doesn\'t exists, use as ref: `This content is locked. Pay with cryptocurrency to access it!`';
        notify(message);
        errors['callToAction'].push(message);
    }
    return errors;
};
const requestAccessToWalllet = (ethereum) => __awaiter(this, void 0, void 0, function* () {
    if (ethereum) {
        try {
            yield ethereum.enable();
        }
        catch (error) {
            notify('Please allow access to metamask to get your keys');
        }
    }
});
const setup = () => {
    // Setup button and actions
    const unlockButton = document.getElementById('unlock');
    if (unlockButton === null) {
        notify('Please add the button to you post');
    }
    else {
        if (window.MutationObserver) {
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    let node = mutation.addedNodes[0];
                    if (node.style)
                        node.style.display = Display.HIDE;
                });
            });
            var config = { attributes: true, childList: true, characterData: true };
            let rootContent = document.getElementsByClassName('post-content')[0];
            observer.observe(rootContent, config);
        }
        ;
        unlockButton.addEventListener('click', (e) => {
            if (errors.locks.general.length == 0)
                alert('This post doesn\'t configure subscriptions, please contact with the adminitrator');
            window['unlockProtocol'] && window['unlockProtocol'].loadCheckoutModal();
        });
        // Always hide content
        const hideElement = document.createElement('script');
        let body = document.getElementsByTagName('body')[0];
        document.addEventListener('DOMContentLoaded', () => {
            var unlockButton = document.getElementById('unlock');
            if (unlockButton.parentElement.tagName === 'FIGURE') {
                hideContent(unlockButton.parentElement, 'section');
            }
            else
                hideContent(unlockButton, 'section');
        }, false);
        body.appendChild(hideElement);
        let errors = checkConfig();
        if (errors.general.length == 0 || errors.locks.general.length == 0) {
            requestAccessToWalllet(window['ethereum']);
            // Actions on unlock events
            window.addEventListener('unlockProtocol', function (e) {
                var state = e['detail'];
                if (state === 'unlocked') {
                    if (window.MutationObserver) {
                        observer.disconnect();
                    }
                    showContent(unlockButton, 'section');
                }
                ;
            });
        }
    }
    // Inject unlock
    (function (d, s) {
        var js = d.createElement(s), sc = d.getElementsByTagName(s)[1];
        js['src'] = "https://paywall.unlock-protocol.com/static/unlock.1.0.min.js";
        sc.parentNode.insertBefore(js, sc);
    }(document, "script"));
};
setup();
