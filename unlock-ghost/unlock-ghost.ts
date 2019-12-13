declare const web3: any;

type Address = string

type URLString = string

type UnlockEvent = {
    detail: string
}

type LockConfig = {
    name: string
}

type ConfigErrors = {
    locks: {general: Array<string>, lock: Array<string>},
    icon: Array<string>,
    callToAction: Array<string>,
    general: Array<string>,
}

type Configuration = {
    locks: {[propName: string]: LockConfig},
    icon: URLString,
    callToAction: { default: string }
}

enum Display {
    HIDE = 'none',
    SHOW = 'block',
}

function notify(message: string, visual?: boolean) {
    if (window['unlockNotify']){
        if (visual) alert(message);
        else console.log(message)
    }
}

function setDisplay(target: HTMLElement, display: Display, topTag?: string) {
    for (let next: HTMLElement = <HTMLElement>target.nextElementSibling;
         next !== null;
         next = <HTMLElement>next.nextElementSibling) {
        next.style.display = display;
    }
}

const showContent = (target: HTMLElement, topTag: string = 'section') => {
    setDisplay(target, Display.SHOW, topTag)
}

const hideContent = (target: HTMLElement, topTag: string = 'section') => {
    setDisplay(target, Display.HIDE, topTag)
}

const checkConfig = (configuration?: Configuration): ConfigErrors => {
    let errors: ConfigErrors = {
        locks: {general: [], lock: []},
        icon: [],
        callToAction: [],
        general: []
    }

    if (!configuration && (window['unlockProtocolConfig'] === null || window['unlockProtocolConfig'] === undefined)) {
        let message = 'Global configuration doesn\'t exists';
        notify(message)
        errors.general.push(message)
        return errors;
    }

    const config = configuration !== undefined && configuration !== null ? configuration : window['unlockProtocolConfig'];

    if (config.locks === undefined || config.locks === null) {
        let message = 'No locks defined, please add some locks!'
        notify(message)
        errors['locks'].general.push(message)
    };

    if (typeof config.locks == 'object') {
        let message = 'Empty locks, please add some locks!'
        notify(message);
        errors['locks'].general.push(message);
    }

    Object.keys(config.locks).forEach((key: Address) => {
        if (typeof web3 !== 'undefined' && web3.utils) {
            if (web3.utils.isAddress(key)) {
                let lockConfig = config.locks[key];
                if (lockConfig.name == null || lockConfig.name === 'undefined') {
                    let message = `ERROR: Provide a name for ${key}`
                    notify(message)
                    errors['locks'].lock.push(message)
                }
            } else {
                let message=`INVALID: ${key} is not a valid lock address`
                notify(message)
                errors['locks'].lock.push(message)
            }
        } else notify(`Error: ${key} couldn't be validated. Enable web3 please!`);
    })

    if (config.icon === null || config.icon === undefined) {
        let message='INVALID: icon url doesn\'t exists, use as ref: `https://staging-app.unlock-protocol.com/static/images/svg/default.svg`'
        notify(message)
        errors['icon'].push(message)
    }

    if (config.callToAction === null || config.callToAction === undefined) {
        let message='INVALID: cta doesn\'t exists, use as ref: `This content is locked. Pay with cryptocurrency to access it!`'
        notify(message)
        errors['callToAction'].push(message)
    }

    return errors;
}


const requestAccessToWalllet = async (ethereum) => {
    if (ethereum) {
        try {
            await ethereum.enable();
        } catch (error) {
            notify('Please allow access to metamask to get your keys');
        }
    }
}


const setup = () => {
    // Setup button and actions
    const unlockButton = document.getElementById('unlock');
    if (unlockButton === null) {
        notify('Please add the button to you post');
    } else {
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    let node = (<HTMLElement>mutation.addedNodes[0])
                    if (node.style) node.style.display = Display.HIDE;
                });
            });

            var config = { attributes: true, childList: true, characterData: true };

            let rootContent = document.getElementsByClassName('post-content')[0]
            observer.observe(rootContent, config);
        };

        unlockButton.addEventListener('click', (e) => {
            if (errors.locks.general.length == 0) alert('This post doesn\'t configure subscriptions, please contact with the adminitrator');
            window['unlockProtocol'] && window['unlockProtocol'].loadCheckoutModal();
        });
        // Always hide content
        const hideElement  = document.createElement('script');
        let body = document.getElementsByTagName('body')[0];

        document.addEventListener('DOMContentLoaded', () => {
            var unlockButton = document.getElementById('unlock');
            if (unlockButton.parentElement.tagName === 'FIGURE') {
                hideContent(unlockButton.parentElement, 'section');
            } else hideContent(unlockButton, 'section');
        }, false);
        body.appendChild(hideElement);

        let errors = checkConfig();
        if (errors.general.length == 0 || errors.locks.general.length == 0) {
            requestAccessToWalllet(window['ethereum']);

            // Actions on unlock events
            window.addEventListener('unlockProtocol', function(e) {
                var state = e['detail']
                if (state === 'unlocked') {
                    if (window.MutationObserver) {
                        observer.disconnect();
	            }

		    var unlockButton = document.getElementById('unlock');
		    unlockButton.style.display = "none";
                    if (unlockButton.parentElement.tagName === 'FIGURE') {
                       showContent(unlockButton.parentElement, 'section');
                    } else showContent(unlockButton, 'section');
                };
            })
        }

    }


    // Inject unlock
    (function(d, s) {
        var js = d.createElement(s),
        sc = d.getElementsByTagName(s)[1];
	js['src']="https://staging-paywall.unlock-protocol.com/static/unlock.1.0.min.js";
        sc.parentNode.insertBefore(js, sc); }(document, "script"));
}

setup()
