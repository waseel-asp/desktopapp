var value, type;

exports.getAmountValue = function(valueData, typeData) {
    if (valueData != null) {
        value = valueData;
        type = typeData;
        return {
            value: value,
            type: type
        };
    }
    return null;
}