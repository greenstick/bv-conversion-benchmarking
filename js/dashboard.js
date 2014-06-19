(function () {

/*
General Utility Functions
*/



/*
Interactive Dashboard
*/

	var Dashboard = function () {
		var dash = this;
			dash.subheader 			= '.subheader',
			dash.jsonPath 			= 'js/data/interactive.json',
			dash.vertical 			= null,
			dash.industry 			= null,
			dash.splash 			= {
				aov					: '.splashAOV',
				conversion 			: '.splashConversion',
				rpv 				: '.splashRPV'
			},
			dash.dd 				= '#selections',
			dash.ddVerticals 		= '#verticalSelect',	
			dash.ddIndustries 		= '#industrySelect',
			dash.filter 			= '.filter',
			dash.ddArrow 			= '.arrow',
			dash.screenOne 			= '#screen-1',
			dash.screenTwo 			= '#screen-2',
			dash.ddVertArray 		= ko.observableArray([]),
			dash.ddInduArray 		= ko.observableArray([]),
			dash.activeVertical 	= ko.observable("Verticals"),
			dash.activeIndustry 	= ko.observable("Industries"),
			dash.verticalOnly 		= ko.observable(true),
			dash.data;
	};

	//Initialize
	Dashboard.prototype.init							= function () {
		var dash = this;
			dash.loading();
			dash.getData(function () {
				dash.loadDropDown();
				dash.splashData();
				dash.loadingDone();
			});
	};

	Dashboard.prototype.loading 						= function (loading) {
		var dash = this;
			$('.loading .rectangle').animate({width: 236}, 1000, function () {
				$(this).animate({width: 0, left: 240}, 1000, function () {
					$(this).css("left", "4px");
					if (loading === false || typeof loading === 'undefined') {
						return
					} else {
						dash.loading(true);
					};
				});
			});
	};

	Dashboard.prototype.loadingDone 					= function () {
		var dash = this;
			dash.loading(false);
			$('.loading').fadeOut(function() {
				$('.datapoints').fadeIn();
			});
	};

	//Get JSON Data
	Dashboard.prototype.getData							= function (callback) {
		var dash = this;
			$.ajax({
				url		: dash.jsonPath,
				type	: "GET"
			}).done(function (res) {
				dash.data = res;
				console.log('XHR Notification: Data Retrieved.');
			}).fail(function () {
				console.log('XHR Alert: Failed to Retrieve JSON Data.');
			}).always(function () {
				console.log('XHR Notification: Request Complete.')
				if (typeof callback === 'function') callback();
			});
	};

	//Render Splash Data
	Dashboard.prototype.splashData 						= function () {
		var dash = this, data = dash.data;
			$(dash.splash.aov).text('+' + (100 * data.roi_rr_aov).toFixed(0) + '%');
			$(dash.splash.conversion).text('+' + (100 * data.roi_rr_conversion).toFixed(0) + '%');
			$(dash.splash.rpv).text('+' + (100 * data.roi_qa_lift_revenue_per_visit).toFixed(0) + '%');
	};

	//Load Vertical Dropdown
	Dashboard.prototype.loadDropDown 					= function () {
		var dash = this;
			$.each(this.data.verticals, function (k, v) {
				dash.ddVertArray.push(v);
			});
	};

	//Dropdown Hover State On
	Dashboard.prototype.dropdownHoverOn 				= function (e) {
		$(e.currentTarget).addClass('hover');
	};

	//Dropdown Hover State Off
	Dashboard.prototype.dropdownHoverOff 				= function (e) {
		$(e.currentTarget).removeClass('hover');
	};

	//Sets Verticals & Populates Industries Observable Array if Industries Exist
	Dashboard.prototype.selectVertical					= function (e) {
		var dash = this, selectedVertical = e.currentTarget.value;
			dash.activeVertical(selectedVertical || "Verticals");
			$.each(dash.data.verticals, function (k, v) {
				if (v.name === selectedVertical) {
					$.each(v, function (ky, vl) {
						if (ky === 'industries') {
							dash.ddInduArray([]);
							if ($.isEmptyObject(vl)) {
								dash.fadeScreens();
							} else {
								$.each(vl, function (key, value) {
									dash.ddInduArray.push(value);
								});
								dash.verticalOnly(false);
								$(dash.ddIndustries).removeClass('inactive');
							};
						};
					});
				};
			});
		$(dash.ddVerticals + ' ' + dash.ddArrow).addClass('selected');
	};

	Dashboard.prototype.selectIndustry					= function (e) {
		var dash = this, selectedIndustry = e.currentTarget.value;
			dash.activeIndustry(selectedIndustry || "Industries");
			$(dash.ddIndustries + ' ' + dash.ddArrow).addClass('selected');
			dash.fadeScreens();
	};

	Dashboard.prototype.fadeScreens						= function () {
		var dash = this;
		$(dash.screenOne).fadeOut(function () {
			$(dash.screenTwo).fadeIn();
		});
	};
	Dashboard.prototype.renderResults					= function () {
		var dash = this;
		if (dash.verticalOnly() === true) {

		} else {

		};
	};
	Dashboard.prototype.renderIcons						= function () {

	};
	Dashboard.prototype.renderHeader					= function () {

	};
	Dashboard.prototype.renderIndustry					= function () {

	};
	Dashboard.prototype.renderHeadData					= function () {

	};
	Dashboard.prototype.renderROIRR						= function () {

	};
	Dashboard.prototype.getROIRRScale					= function (value, total) {

	};
	Dashboard.prototype.drawROIRRChart					= function (property, x) {

	};
	Dashboard.prototype.renderROIQA						= function () {

	};
	Dashboard.prototype.drawROIQAtext					= function (property) {

	};
	Dashboard.prototype.renderAverageRating				= function () {

	};
	Dashboard.prototype.renderRatingDistribution		= function () {

	};

	var dashboard = new Dashboard ();
		dashboard.init();
		ko.applyBindings(dashboard);

/*
Event Bindings
*/

//Dropdown Mouseover
$(dashboard.dd).on("mouseover", dashboard.ddVerticals + ', ' + dashboard.ddIndustries, function (e) {
	dashboard.dropdownHoverOn(e);
})
//Dropdown Mouseover
$(dashboard.dd).on("mouseout", dashboard.ddVerticals + ', ' + dashboard.ddIndustries, function (e) {
	dashboard.dropdownHoverOff(e);
})
//Select Vertical
$(dashboard.dd).on("click", dashboard.ddVerticals + ' ' + dashboard.filter, function (e) {
	dashboard.selectVertical(e);
});
//Select Industry
$(dashboard.dd).on("click", dashboard.ddIndustries + ' ' + dashboard.filter, function (e) {
	dashboard.selectIndustry(e);
});

}(jQuery, ko, d3))