import moment from "moment"

class HomeFunctions {
    calculateTime = (time) => {
        // Current Time
        const hourNow = parseInt(moment().format('hh:mm a').substring(0, 2))
        const minuteNow = parseInt(moment().format('hh:mm a').substring(3, 5))
        const morning_afternoonNow = moment().format('hh:mm a').substring(6, 8)

        // Item Time
        const hour = parseInt(time.substring(0, 2))
        const minute = parseInt(time.substring(3, 5))
        const morning_afternoon = time.substring(6, 8)

        // "Accepted" = true means the reminder time is larger than current time.
        let accepted = false

        // If Time Now is "am"
        if (morning_afternoonNow == "am") {
            // If Item Time is "am"
            if (morning_afternoon == "am") {
                // If Hour values are similar
                if (hour == hourNow) {
                    // If Item Minute larger than Minute Now
                    if (minute > minuteNow) {
                        accepted = true
                    }
                    // If Hour Now is not 12, and Item Hour is 12
                } else if (hour == 12) {

                    // If Hour Now is 12, and Item Hour is not 12
                } else if (hourNow == 12) {
                    accepted = true
                    // If Hour Now and Item Hour are both not 12, 
                    // and they are not the same
                } else {
                    if (hour > hourNow) {
                        accepted = true
                    }
                }
                // If Item Time is "pm"
            } else {
                accepted = true
            }
            // If Time Now is "pm"
        } else {
            // If Item Time is "pm"
            if (morning_afternoon == "pm") {
                // If Hour values are similar
                if (hour == hourNow) {
                    if (minute > minuteNow) {
                        accepted = true
                    }
                    // If Hour Now is not 12, and Item Hour is 12
                } else if (hour == 12) {

                    // If Hour Now is 12, and Item Hour is not 12
                } else if (hourNow == 12) {
                    accepted = true
                    // If Hour Now and Item Hour are both not 12, 
                    // and they are not the same
                } else {
                    if (hour > hourNow) {
                        accepted = true
                    }
                }
            }
        }
        return accepted
    }
}

export default new HomeFunctions()