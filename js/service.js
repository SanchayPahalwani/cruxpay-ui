window.initVue = function() {
    function getSearchParam(query) {
        if ('URLSearchParams' in window) {
            var urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(query);
        }
    }

    function isIFrame(){
        return getSearchParam('mode') && getSearchParam('mode').includes('iframe');
    }

    var app = new Vue({
        el: "#app",
        data: {
            block_message_text: {
                "send-payment-request": "Please login into your OpenPay enabled app where you want to receive payment request.",
                "payment-failed": "Payment failed because OpenPay request expired.",
                "payment-success": "Payment Approved",
                "channel-created": "Please accept the request from Uber on your OpenPay enabled app."
            },
            user_data: {
                authenticate_long: false,
                openpay_password: null,
                openpay_id: null,
                public_key: null
            },
            show_overlay: false,
            show_loader: false,
            show_retry_button: false,
            current_block_message_text: "",
            timer: 10
        },
        methods: {
            retry: function() {
                this.show_overlay = false;
                this.show_retry_button = false;
            },
            send_payment_request: function(e) {
                this.show_loader = true;
                this.show_overlay = true;
                this.current_block_message_text = this.block_message_text["send-payment-request"];
                // Request for the user's publicKey information
                this.send_message("get_public_key", {
                    openpay_id: this.user_data.openpay_id
                });
                document.querySelector(".openpay__base").style.transform = `translateX(${(-1 / 4) * 100}%)`;
            },
            payment_failed: function() {
                this.show_overlay = true;
                this.show_loader = false;
                this.show_retry_button = true;
                this.current_block_message_text = this.block_message_text["payment-failed"];
            },
            payment_initiated: function() {
                this.show_overlay = true;
                this.show_loader = false;
                this.current_block_message_text = this.block_message_text["payment-success"];
                document.querySelector(".openpay__base").style.transform = `translateX(${(-3 / 4) * 100}%)`;
                document.querySelector(".check-icon").style.display = "block";
                this.initCountdown();
            },
            payment_request_received: function() {
                this.show_overlay = true;
                this.show_loader = true;
                this.current_block_message_text = this.block_message_text["channel-created"];
                document.querySelector(".openpay__base").style.transform = `translateX(${(-2 / 4) * 100}%)`;
            },
            set_user_public_key: function(public_key) {
                console.log(`using the user public key as ${public_key}`);
                this.user_data.public_key = public_key;
                // Generate an accessToken using the TokenController and passback
                let encryptionPayload = OpenPay.TokenController.generateAccessToken(this.user_data.openpay_password, this.user_data.public_key);
                // { accessToken: string, ephemeralPublicKey?: string, iv?: string, encryptedValidity?: string }
                console.log(`Encrytion payload generated: `, encryptionPayload);
                let receiverData = {
                    receiverVirtualAddress: this.user_data.openpay_id,
                    receiverPublicKey: public_key
                };
                console.log(`Receiver data: `, receiverData);
                this.send_message("encryption_payload", {
                    encryptionPayload,
                    receiverData
                });
            },
            send_message: function(type, data) {
                mp.communicator.postMessage(type, data);
            },
            destroy_page: function(shouldEmit) {
                if (!isIFrame()) {
                    window.close();
                } else {
                    this.send_message("close", {});
                }
            },
            initCountdown() {
                let localTimer = this.timer;
                if (localTimer-- > 0) {
                    this.timer--;
                    setTimeout(this.initCountdown, 1000);
                } else {
                    this.destroy_page();
                }
            }
        }
    });

    function onPostMessage(message) {
        switch (message.type) {
            case "payment_failed":
                app.payment_failed();
                break;
            case "payment_initiated":
                app.payment_initiated();
                break;
            case "payment_request_received":
                app.payment_request_received();
                break;
            case "public_key":
                app.set_user_public_key(message.data.public_key);
                break;
            default:
                console.warn("unhandled:" + JSON.stringify(message));
        }
    }
    window.onload = function() {
        if (isIFrame()) {
            window.mp = new OpenPay.MessageProcessor((type = "iframe"), (source = window.parent), (target = "*"), (handler = onPostMessage));
            document.body.classList.add('openpay__iframe');
        } else {
            window.mp = new OpenPay.MessageProcessor((type = "newtab"), (source = window.opener), (target = "*"), (handler = onPostMessage));
        }
    };
};
