import {patch} from "@web/core/utils/patch";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { CustomButton } from "./custom_button/custom_button";

// You can do this
// ControlButtons.components = {
//     ...ControlButtons.components,
//     CustomButton
// }
// Or this
patch(ControlButtons, {
    components: {
        ...ControlButtons.components,
        CustomButton,
    },
});
