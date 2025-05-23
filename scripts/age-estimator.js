class AgeEstimator {
    constructor() {

    }

    verifyAge(params = {}) {
        if(params.localTesting) {
            this._verifyAgeLocal(params);
            return;
        }
        window.location.href = 'https://universal-verify.github.io/age-estimator/';
    }

    /**
     * Verify age locally
     * @param {Object} params - The parameters for the age verification
     * @param {Function} params.successCallback - The callback function to call if the age verification is successful (optional)
     * @param {Function} params.errorCallback - The callback function to call if the age verification fails (optional)
     */
    _verifyAgeLocal(params = {}) {
        let nonce = Math.random().toString(36).substring(2, 15);
        const newTab = window.open('/index.html', '_blank');
        window.addEventListener('message', (event) => {
            if(event.source !== newTab) return;
            if(event.data.type === 'age-estimation-result') {
                if(event.data.nonce !== nonce) return;
                if(params.successCallback) {
                    params.successCallback(event.data.age);
                } else {
                    console.log('Missing successCallback for age estimation');
                }
                newTab.close();
            } else if(event.data.type === 'age-estimation-error') {
                if(params.errorCallback) {
                    if(event.data.nonce !== nonce) return;
                    params.errorCallback(event.data.error);
                } else {
                    console.log('Missing errorCallback for age estimation');
                }
                newTab.close();
            } else if(event.data.type === 'check-parent-commandeer') {
                newTab.postMessage({ type: 'confirm-parent-commandeer', nonce }, window.location.origin);
            }
        });
    }
}

const ageEstimator = new AgeEstimator();
export default ageEstimator;