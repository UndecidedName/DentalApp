dentalApp.filter('Date', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        return $filter('date')(value, "MM/dd/yyyy");
    }
});
dentalApp.filter('DateTime', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        return $filter('date')(value, "MM/dd/yyyy HH:mm:ss");
    }
});
dentalApp.filter('FormattedTime', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        var day = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + value;
       return $filter('date')(new Date(day).getTime(), "hh:mm a");
       
    }
});
dentalApp.filter('Boolean', function ($filter) {
    return function (value) {
        if (value == true)
            return "Yes";
        else
            return "No";
    }
});
dentalApp.filter('Default', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        return value;
    }
});
dentalApp.filter('StringUpper', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        return value.toUpperCase();
    }
});
dentalApp.filter('ProperCase', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        var words = value.split(' ');
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(' ');
    }
});
dentalApp.filter('Decimal', function ($filter) {
    return function (value) {
        if (value == "" || value == null)
            return "";
        else
            return value.toFixed(4);

    }
});
dentalApp.filter('StatusMaintenance', function ($filter) {
    return function (value) {
        if (value == 1)
            return "Active";
        else
            return "Inactive";

    }
});
dentalApp.filter('StatusTransaction', function ($filter) {
    return function (value) {
        if (value == 0)
            return "For Approval";
        else if(value == 1)
            return "Approved";
        else if (value == 2)
            return "Disapproved";
        else
            return "Cancelled";

    }
});
