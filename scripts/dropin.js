import AgeEstimator from './age-estimator.js';

const iconSVGString = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" xmlns:bx="https://boxy-svg.com"><defs><bx:export><bx:file format="svg" href="#object-0" units="pt"/><bx:file format="svg" path="Untitled 2.svg" units="pt"/></bx:export></defs><ellipse style="stroke: rgb(0, 0, 0); fill: rgb(255, 255, 255);" cx="256.478" cy="242.4" rx="206.689" ry="215.167"/><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none" id="object-0"><path d="M2435 5076 c-156 -61 -1935 -820 -1972 -841 -106 -63 -211 -188 -261 -313 -27 -67 -27 -69 -26 -312 0 -193 5 -280 22 -410 133 -994 517 -1825 1127 -2435 263 -263 577 -491 904 -654 241 -121 421 -121 662 0 413 207 814 523 1108 875 493 588 808 1343 922 2209 18 134 23 222 23 415 1 244 1 245 -26 312 -50 125 -155 250 -261 313 -40 23 -1936 830 -2006 854 -56 18 -149 13 -216 -13z m1060 -1034 l820 -348 -2 -125 c-3 -146 -25 -340 -59 -529 -176 -956 -661 -1736 -1366 -2197 -93 -60 -308 -183 -322 -183 -3 0 -6 850 -6 1890 l0 1889 58 -24 c31 -14 426 -182 877 -373z m-2145 -1332 c5 -504 5 -505 28 -553 46 -92 133 -137 267 -137 176 0 269 73 295 231 6 37 10 253 10 517 l0 452 140 0 140 0 0 -482 c-1 -532 -5 -590 -59 -703 -54 -117 -152 -198 -291 -240 -34 -10 -107 -19 -190 -22 -344 -14 -531 97 -607 362 -15 52 -17 125 -21 573 l-3 513 143 -3 143 -3 5 -505z" style="fill: rgb(36, 99, 235);"/><path d="M2722 3197 c2 -7 109 -327 238 -710 l235 -697 169 2 169 3 238 708 238 707 -142 0 -143 0 -170 -527 c-119 -372 -174 -529 -184 -531 -12 -2 -23 21 -44 85 -15 48 -93 287 -172 531 l-145 442 -145 0 c-115 0 -145 -3 -142 -13z" style="fill: rgb(36, 99, 235);"/></g></svg>';
const defaultColor = '#2463eb';
//const defaultColor = '#dc2626';

class Dropin {
    constructor() {
        this.setConfig();
        this.tempInit();
    }

    setConfig() {
        let globalConfig = window.uvaeConfig || {};
        this._minAge = Number.isInteger(globalConfig.minAge) ? globalConfig.minAge : 18;
        this._primaryColor = globalConfig.primaryColor || defaultColor;
        this._zIndex = globalConfig.zIndex || '9999999';
    }

    async tempInit() {
        if(await this.hasValidToken()) return;
        this.setupAgeGate();
    }

    async hasValidToken() {
        const token = AgeEstimator.getCachedToken();
        if(!token) return false;
        try {
            const decoded = await AgeEstimator.verifyToken(token);
            if(!decoded || !Number.isInteger(decoded.age) || decoded.age < this._minAge) {
                AgeEstimator.clearCache();
                return false;
            }
            return true;
        } catch(error) {
            AgeEstimator.clearCache();
            return false;
        }
    }

    setupAgeGate() {
        this._ageGate = document.createElement('div');
        Object.assign(this._ageGate.style, {
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            zIndex: this._zIndex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        const content = document.createElement('div');
        Object.assign(content.style, {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '448px',
            width: '100%',
            margin: '0 16px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        });
        
        const innerContent = document.createElement('div');
        innerContent.style.textAlign = 'center';
        
        const icon = document.createElement('div');
        icon.innerHTML = iconSVGString;
        Object.assign(icon.style, {
            width: '48px',
            height: '48px',
            margin: '0 auto 1rem auto',
            display: 'block',
            overflow: 'hidden'
        });

        // Adjust the SVG element's size
        const svg = icon.querySelector('svg');
        Object.assign(svg.style, {
            width: '100%',
            height: '100%',
            display: 'block'
        });

        // Set the fill color for all paths in the SVG
        const paths = icon.querySelectorAll('path');
        paths.forEach(path => {
            path.style.fill = this._primaryColor;
        });
        
        const title = document.createElement('h2');
        title.style.cssText = 'font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;';
        title.textContent = 'Age Verification Required';
        
        this._description = document.createElement('p');
        this._description.style.cssText = 'color: #d1d5db; margin-bottom: 1.5rem;';
        this._description.textContent = 'Please verify your age using our age estimator.';
        
        const button = document.createElement('button');
        Object.assign(button.style, {
            backgroundColor: this._primaryColor, // Lighter blue
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        });
        button.textContent = 'Verify Age';
        
        // Add hover effect
        button.onmouseover = () => button.style.backgroundColor = getAdjustedColor(this._primaryColor, -20);
        button.onmouseout = () => button.style.backgroundColor = this._primaryColor;
        
        innerContent.appendChild(icon);
        innerContent.appendChild(title);
        innerContent.appendChild(this._description);
        innerContent.appendChild(button);
        content.appendChild(innerContent);
        this._ageGate.appendChild(content);
        this._ageGate.id = 'age-verification-overlay';
        document.documentElement.appendChild(this._ageGate);

        // Create success overlay
        this._successOverlay = document.createElement('div');
        Object.assign(this._successOverlay.style, {
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            zIndex: this._zIndex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const successContent = document.createElement('div');
        successContent.style.textAlign = 'center';
        successContent.style.color = 'white';
        successContent.textContent = 'Thank you for verifying your age.';

        this._successOverlay.appendChild(successContent);

        // Add event listener for the verify button
        button.addEventListener('click', () => this._handleVerifyClick());
    }

    async _handleVerifyClick() {
        try {
            const age = await AgeEstimator.estimateAge({
                enableCache: true,
                livenessCheck: true,
                localTesting: window.location.origin.includes('localhost')
            });

            if(age < this._minAge) {
                AgeEstimator.clearCache();
            } else {
                this._successOverlay.style.display = 'flex';
                this._ageGate.style.display = 'none';
                setTimeout(() => {
                    this._successOverlay.style.display = 'none';
                }, 4000);
            }
        } catch(error) {
            if(error === 'DIFFERENT_FACE_ERROR') {
                this._description.textContent = `Different face detected during liveness check. Please try again.`;
            } else if(error === 'WEBCAM_ERROR') {
                this._description.textContent = `Unable to access your webcam. Please ensure you have granted camera permissions.`;
            } else if(error === 'POPUP_BLOCKED') {
                this._description.textContent = `Popup was blocked. Please allow popups for this site and try again.`;
            } else if(error === 'CANCELLED') {
                this._description.textContent = `Age verification was cancelled. Please try again.`;
            } else {
                this._description.textContent = `An error occurred while verifying your age. Please try again.`;
            }
        }
    }
}

function getAdjustedColor(color, amount) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust each component
    const adjust = (c) => {
        const newValue = Math.max(0, Math.min(255, c + amount));
        return newValue.toString(16).padStart(2, '0');
    };

    // Return new hex color
    return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
}

const dropin = new Dropin();