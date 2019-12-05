$(document).ready(function () {
	let currentInput;
	let registrar = window.isDev ? 'https://registrar.coinswitch.co:3000' : 'https://registrar-prod.coinswitch.co:3000';
	let appCtrl = new function () {
		this.availableStates = ['registration', 'customisation'];
		this.registration = {
			el: $('#registration'),
			hide() {
				this.el.addClass('cs-hide');
			},
			show() {
				this.el.removeClass('cs-hide');
			}
		};
		this.customisation = {
			el: $('#customisation'),
			hide() {
				this.el.addClass('cs-hide');
			},
			show() {
				this.el.removeClass('cs-hide');
			}
		};
		this.renderState = (state) => {
			if (this.availableStates.includes(state)) {
				for (let thisState of this.availableStates) {
					if (thisState === state) {
						this[thisState].show();
					} else {
						this[thisState].hide();
					}
				}
			}
		}
		this.renderApp = (currentInput) => {
			if (currentInput && currentInput.payIDName) {
				this.renderState('customisation');
				currency.init({
					payIDName: currentInput.payIDName,
					availableCurrencies: currentInput.availableCurrencies,
					publicAddressCurrencies: currentInput.publicAddressCurrencies,
					allCurrencies: currentInput.assetList && currentInput.clientMapping && currentInput.assetList.length > 0 && Object.keys(currentInput.clientMapping).length > 0 ? curlistAdapter(currentInput.assetList, currentInput.clientMapping) : [],
				});
			} else {
				this.renderState('registration')
			}
		}
	}

	let loader = {
		show(el, handlerFn) {
			el.attr('disabled', 'true');
			el.off('click', handlerFn);
		},
		hide(el, handlerFn) {
			el.removeAttr('disabled', 'false');
			el.on('click', handlerFn);
		}
	}

	/*******************************
			Registration
	********************************/

	const textFields = document.querySelectorAll(".mdc-text-field");
	for (const textField of textFields) {
		mdc.textField.MDCTextField.attachTo(textField);
	}

	const cruxpayId = {
		input: $('#cruxpayId'),
		inputParent: $('.cruxpay-id__container'),
		helperText: $('#cruxpay-id__helper-text'),
		parentContainer: $('.cruxpay-id__container').parent(),
		isValid: false,
		displayError(message) {
			this.helperText.removeClass('helper-text--success');
			this.inputParent.addClass('mdc-text-field--invalid');
			this.parentContainer.addClass('has-error');
			this.helperText.html(message);
		},
		displaySuccess(message) {
			cruxpayId.inputParent.removeClass('mdc-text-field--invalid');
			cruxpayId.helperText.addClass('helper-text--success');
			cruxpayId.parentContainer.removeClass('has-error');
			cruxpayId.helperText.html(message);
		},
		displayHelpText(message) {
			cruxpayId.helperText.removeClass('helper-text--success');
			cruxpayId.inputParent.removeClass('mdc-text-field--invalid');
			cruxpayId.parentContainer.removeClass('has-error');
			cruxpayId.helperText.html(message);
		},
		getId() {
			return this.input.val();
		},
		validation: {
			hasDigit(id) {
				const re = /[0-9]/;
				return re.test(id);
			},
			hasAlphabets(id) {
				const re = /[A-Za-z]/;
				return re.test(id);
			},
			isValid(id) {
				let isvalid = false;
				if (this.hasDigit(id)) {
					if (this.hasAlphabets(id)) {
						isvalid = true
					}
				}
				return isvalid
			}
		},
		runValidations(id) {
			if (this.validation.hasDigit(id)) {
				this.isValid = true;
			} else {
				this.isValid = false;
				this.displayError(`Your ID should contain numbers`);
			}

			if (this.validation.hasAlphabets(id)) {
				this.isValid = true;
			} else {
				this.isValid = false;
				this.displayError(`Your ID should contain alphabets`);
			}
		}
	}

	let timer = null;
	cruxpayId.input.on('keyup', (e) => {
		cruxpayId.displayHelpText(`Checking availability`);
		cruxpayId.isValid = false;
		clearTimeout(timer);
		timer = setTimeout(function () {
			const inputId = e.target.value;
			if (inputId && inputId.length > 0) {
				if (cruxpayId.validation.hasDigit(inputId)) {
					if (cruxpayId.validation.hasAlphabets(inputId)) {
						isUserIdAvailable(inputId);
					} else {
						cruxpayId.displayError(`Your ID should contain alphabets`);
					}
				} else {
					cruxpayId.displayError(`Your ID should contain numbers`);
				}
			}
		}, 500)
	})
	function isUserIdAvailable(id) {
		$.ajax({
			type: "GET",
			url: `${registrar}/status/${id}`,
			success: function (response) {
				cruxpayId.isValid = false;
				cruxpayId.displayError(`${id} is unavailable`);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				if (xhr.status == 404) {
					cruxpayId.isValid = true;
					cruxpayId.displaySuccess(`${id} is available`);
				}
			}
		});
	}

	const password = {
		input: $('#cruxpayPassword'),
		helperText: $('#cruxpay-password__helper-text'),
		inputParent: $('.cruxpay-password__container'),
		parentContainer: $('.cruxpay-password__container').parent(),
		isValid: false,
		validation: {
			isValid(p) {
				const re = /^[a-zA-Z0-9$@!#^&%_-]{8,50}$/;
				return re.test(String(p).toLowerCase());
			},
			containsId(p) {
				return p === cruxpayId.input.val();
			},
			hasDigit(p) {
				const re = /[0-9]/;
				return re.test(p);
			},
			hasLowerCase(p) {
				const re = /[a-z]/;
				return re.test(p);
			},
			hasUpperCase(p) {
				const re = /[A-Z]/;
				return re.test(p);
			},
			hasSpecialCharacter(p) {
				const re = /(?=.*[!#$%&?@"])/;
				return re.test(p);
			}
		},
		displayError(message) {
			this.helperText.removeClass('helper-text--success');
			this.inputParent.addClass('mdc-text-field--invalid');
			this.parentContainer.addClass('has-error');
			this.helperText.html(message);
		},
		clearAllError() {
			this.helperText.addClass('helper-text--success');
			this.inputParent.removeClass('mdc-text-field--invalid');
			this.parentContainer.removeClass('has-error');
			this.helperText.html('');
		},
		toggleValidationBlock(state) {
			if (state) {
				$('.validation-rules').css('opacity', 1);
			} else {
				$('.validation-rules').css('opacity', 0);
			}

		},
		setValidation(name, state) {
			let validationEl = $(`#validation-${name}`);
			this.isValid = state;
			if (validationEl && validationEl.length > 0) {
				if (state) {
					validationEl.removeClass('rule-isInvalid');
					validationEl.addClass('rule-isValid');
				} else {
					validationEl.addClass('rule-isInvalid');
					validationEl.removeClass('rule-isValid');
				}
			}
		},
		getPassword() {
			return this.input.val();
		},
		runValidations(passphrase) {
			if (this.validation.isValid(passphrase)) {
				this.setValidation('charLen', true);
			} else {
				this.setValidation('charLen', false);
				this.displayError('Minimum length required is 8. Only following special characters !,#,$,%,&,?,@ are allowed');
			}

			if (!this.validation.containsId(passphrase)) {
				this.setValidation('sameAsId', true);
			} else {
				this.setValidation('sameAsId', false);
				this.displayError('Password must be different from CruxPay ID');
			}

			if (this.validation.hasDigit(passphrase)) {
				this.setValidation('digit', true);
			} else {
				this.setValidation('digit', false);
				this.displayError('Password must be have atleast one number');
			}

			if (this.validation.hasLowerCase(passphrase)) {
				this.setValidation('lowercase', true);
			} else {
				this.setValidation('lowercase', false);
				this.displayError('Password must be have atleast one lowercase letter');
			}

			if (this.validation.hasUpperCase(passphrase)) {
				this.setValidation('uppercase', true);
			} else {
				this.setValidation('uppercase', false);
				this.displayError('Password must be have atleast one uppercase letter');
			}

			if (this.validation.hasSpecialCharacter(passphrase)) {
				this.setValidation('specialCharater', true);
				// this.toggleValidationBlock(false);
				this.clearAllError();
			} else {
				this.setValidation('specialCharater', false);
				this.displayError('Password must be have atleast one of following special characters !,#,$,%,&,?,@ are allowed');
			}
		}
	}

	password.input.on('keyup', (e) => {
		password.toggleValidationBlock(true);
		password.runValidations(password.getPassword());
	})

	$('#createId').on('click', createNewID);
	function createNewID() {
		if (cruxpayId.isValid && password.isValid) {
			loader.show($('#createId'), createNewID);
			let inputPayIDName = cruxpayId.getId();
			let inputPayIDPass = password.getPassword();
			appCtrl.data = {
				newPayIDName: inputPayIDName,
				newPayIDPass: inputPayIDPass
			}
			currentInput.payIDName = inputPayIDName;
			appCtrl.renderApp(currentInput);
		} else {
			if (!password.isValid) {
				password.runValidations(password.getPassword());
			}
			if (!cruxpayId.isValid) {
				if (cruxpayId.getId() && cruxpayId.getId().length > 0) {
					if (cruxpayId.validation.isValid(cruxpayId.getId())) {
						cruxpayId.displayError(`${cruxpayId.getId()} is unavailable`)
					} else {
						cruxpayId.runValidations(cruxpayId.getId())
					}
				} else {
					cruxpayId.displayError('cruxpay id is needed');
				}
			}
		}
	}



	/*******************************
			Customisation
	********************************/
	let currency = {
		container: $('#currencyContainer'),
		selectedCurCintainer: $('#selectedCurContainer'),
		search: $('#cruxSearchCur'),
		selectedRadio: 'custom',
		radioContainer: $('.customisation__radio-select'),
		init({ payIDName, availableCurrencies, publicAddressCurrencies, allCurrencies }) {
			$('#cruxpayIdName').html(payIDName);
			let currenciesToRender = [];
			for (let currency of allCurrencies) {
				if (availableCurrencies[currency.symbol]) {
					if (publicAddressCurrencies.includes(currency.symbol)) {
						currency.selected = true;
					} else {
						currency.selected = false;
					}
					currenciesToRender.push(currency);
				}
			}

			this.list = currenciesToRender;

			this.renderRadios();
			this.search.on('keyup', (event) => {
				let filteredList = this.filter(this.list, event.target.value);
				this.renderCurList(filteredList);
			})

			this.renderCurList(this.list);
			this.renderSelectedCurPills(this.list);

		},
		availableRadios: [{
			id: 'radio-selectCustom',
			value: 'custom',
			name: 'Custom'
		}, {
			id: 'radio-selectAll',
			value: 'all',
			name: 'All'
		}, {
			id: 'radio-selectPopular',
			value: 'popular',
			name: 'Popular'
		}, {
			id: 'radio-selectNone',
			value: 'none',
			name: 'None'
		}],
		renderCurList(curlist) {
			let template = '';
			for (let cur of curlist) {
				template += this.renderCur(cur);
			}
			$(this.container).html(template);
			this.bindCheckboxEvents();
		},
		renderCur({ name, symbol, img, selected }) {
			return `
			<div class="customisation__currency ${selected ? 'customisation__currency--isSelected' : ''} ">
				<div class="mdc-form-field">
					<div class="mdc-checkbox">
						<input
							data-symbol="${symbol}"
							type="checkbox"
							class="mdc-checkbox__native-control"
							id="checkbox-${symbol}"
							${selected ? 'checked' : ''}
						/>
						<div class="mdc-checkbox__background">
							<svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
							<path
								class="mdc-checkbox__checkmark-path"
								fill="none"
								d="M1.73,12.91 8.1,19.28 22.79,4.59"
							/>
							</svg>
							<div class="mdc-checkbox__mixedmark"></div>
						</div>
					</div>
					<label for="checkbox-${symbol}" class="customisation__checkbox-label">
						<img class="customisation__currency-logo" src="${img}" />
						<div class="customisation__currency-name">${name}</div>
					</label>
				</div>
				<div class="customisation__currency-symbol">${symbol.toUpperCase()}</div>
			</div>
			`
		},
		renderSelectedCurPills(curlist) {
			let template = '';
			for (let cur of curlist) {
				if (cur.selected) template += this.renderSelectedPill(cur);
			}
			$(this.selectedCurCintainer).html(template);
			this.bindPillEvents();
		},
		renderSelectedPill({ symbol }) {
			return `
				<div class="selected-currency__pill">
					<strong>${symbol.toUpperCase()}</strong>
					<i class="material-icons" data-symbol="${symbol}">clear</i>
				</div>
			`
		},
		renderRadios() {
			let template = '';
			for (let radio of this.availableRadios) {
				template += this.renderRadioEl(radio);
			}
			$(this.radioContainer).html(template);
			this.bindRadioEvents();
		},
		renderRadioEl({ id, value, name }) {
			return `
				<div class="mdc-form-field">
					<div class="mdc-radio mdc-custom-radio">
						<input class="mdc-radio__native-control" type="radio" id="${id}" name="radios" value="${value}">
						<div class="mdc-radio__background">
							<div class="mdc-radio__outer-circle"></div>
							<div class="mdc-radio__inner-circle"></div>
						</div>
					</div>
					<label for="${id}">${name}</label>
				</div>
			`
		},
		filter(list, query) {
			let searchString = query || '';
			try {
				let searchRegex = new RegExp(searchString, 'ig');
				return list.filter(function (coin) {
					return coin.name.match(searchRegex) || coin.symbol.match(searchRegex);
				});
			} catch (e) {
				return [];
			}
		},
		bindCheckboxEvents() {
			$('.mdc-checkbox__native-control').on('click', (event) => {
				let el = $(event.target);
				for (let index in this.list) {
					let coin = this.list[index];
					if (coin.symbol === el.data('symbol')) {
						this.list[index].selected = el.is(':checked')
					}
				}

				$('#radio-selectCustom').prop('checked', 'true');
				this.renderSelectedCurPills(this.list);
			})
		},
		bindPillEvents() {
			$('.selected-currency__pill').on('click', (event) => {
				let el = $(event.target);
				for (let index in this.list) {
					let coin = this.list[index];
					if (coin.symbol === el.data('symbol')) {
						this.list[index].selected = false
					}
				}
				$('#radio-selectCustom').prop('checked', 'true');
				this.renderCurList(this.list);
				this.renderSelectedCurPills(this.list);
			})
		},
		bindRadioEvents() {
			$('.mdc-radio__native-control').on('click', (event) => {
				switch (event.target.value) {
					case 'custom':
						this.selectedRadio = 'custom';
						break;
					case 'popular':
						let popularCoins = ['btc', 'eth', 'xrp', 'bch', 'ltc'];
						for (let index in this.list) {
							let coin = this.list[index];
							if (popularCoins.includes(coin.symbol)) {
								this.list[index].selected = true;
							} else {
								this.list[index].selected = false;
							}
						}
						this.renderCurList(this.list);
						this.renderSelectedCurPills(this.list);
						this.selectedRadio = 'popular';
						break;
					case 'all':
						for (let index in this.list) {
							this.list[index].selected = true;
						}
						this.renderCurList(this.list);
						this.renderSelectedCurPills(this.list);
						this.selectedRadio = 'all';
						break;
					case 'none':
						for (let index in this.list) {
							this.list[index].selected = false;
						}
						this.renderCurList(this.list);
						this.renderSelectedCurPills(this.list);
						this.selectedRadio = 'none';
						break;
				}
			})
			let radios = $('.mdc-radio__native-control');
			for (let radio of radios) {
				if (this.selectedRadio === radio.value) {
					radio.setAttribute('checked', 'true');
				}
			}
		}
	}

	function handleCustomisation() {
		loader.show($('#updateCustomization'), handleCustomisation);
		let checkedCurrencies = [];
		for (let cur of currency.list) {
			if (cur.selected) {
				checkedCurrencies.push(cur.symbol.toUpperCase())
			}
		}

		if (appCtrl.isExistingAccount) {
			let existingMessage = {
				type: 'editExisting',
				data: {
					checkedCurrencies: checkedCurrencies
				}
			};
			existingMessage = JSON.stringify(existingMessage)
			existingMessage = OpenPay.Encryption.eciesEncryptString(existingMessage, window.encryptionKey)
			window.parent.postMessage(existingMessage, '*');
		} else {
			let registerMessage = {
				type: 'createNew',
				data: {
					newPayIDName: appCtrl.data.newPayIDName,
					newPayIDPass: appCtrl.data.newPayIDPass,
					checkedCurrencies: checkedCurrencies
				}
			};
			registerMessage = OpenPay.Encryption.eciesEncryptString(JSON.stringify(registerMessage), window.encryptionKey)
			window.parent.postMessage(registerMessage, '*');
		}
	}

	$('#updateCustomization').on('click', handleCustomisation);

	function handleCloseSetup() {
		let closeIframeMessage = {
			type: 'closeIframe'
		}
		closeIframeMessage = OpenPay.Encryption.eciesEncryptString(JSON.stringify(closeIframeMessage), window.encryptionKey)
		window.parent.postMessage(closeIframeMessage, '*')
	}
	$('#closeSetup').on('click', handleCloseSetup);

	function curlistAdapter(assetList, clientMapping) {
		let assetIdtoClientidMap = {}
		for (let clientKey in clientMapping) {
			assetIdtoClientidMap[clientMapping[clientKey]] = clientKey
		}
		let applicableAssetIdList = []
		for (let i in assetList) {
			let current = assetList[i];
			if (current.assetId in assetIdtoClientidMap) {
				let currentAsset = { name: current.name, symbol: assetIdtoClientidMap[current.assetId], img: current.image_sm_url }
				applicableAssetIdList.push(currentAsset);
			}
		}
		return applicableAssetIdList;
	}

	function datalookup() {
		if (window.walletInfo) {
			currentInput = window.walletInfo
			appCtrl.isExistingAccount = currentInput.payIDName ? true : false;
			appCtrl.renderApp(currentInput);
		} else {
			setTimeout(() => {
				datalookup();
			}, 500);
		}
	}
	datalookup();

});




