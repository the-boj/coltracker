import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button, Input, Select } from "@mui/material";
import { useState } from "react";
import { updateElement } from "../api/elements";
import { CategoryData } from "../api/types";

interface BaseModal {
  category: string;
  text: string;
}

interface PriceModal extends BaseModal {
  type: "price";
  category: string;
  data: CategoryData;
}
interface RatingModal extends BaseModal {
  type: "rating";
  category: string;
  data: CategoryData;
}

interface ConditionModal extends BaseModal {
  type: "condition";
  category: string;
  data: CategoryData;
}

export type ModalType = PriceModal | RatingModal | ConditionModal;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface Props {
  state?: ModalType;
  onClose: () => void;
  onValidate: () => void;
}

export default function ModalInput({ state, onClose, onValidate }: Props) {
  const [inputValue, setInputValue] = useState<string | undefined>();

  function validate() {
    if (state?.type === "price") {
      updateElement({
        data: {
          category: state.category,
          item: {
            ...state.data,
            status: inputValue ? "owned" : "not-owned",
            price: inputValue ? Number(inputValue) : undefined,
          },
        },
      });
    } else if (state?.type === "rating") {
      updateElement({
        data: {
          category: state.category,
          item: {
            ...state.data,
            rating: inputValue ? Number(inputValue) : undefined,
          },
        },
      });
    } else if (state?.type === "condition") {
      updateElement({
        data: {
          category: state.category,
          item: {
            ...state.data,
            condition: inputValue as
              | "new"
              | "mint"
              | "used"
              | "damaged"
              | undefined,
          },
        },
      });
    }
    onValidate();
    onClose();
  }

  return (
    <div>
      <Modal
        open={!!state}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {state?.text}
          </Typography>
          {getComponentInput(state?.type || "", setInputValue)}
          <div style={{ display: "flex" }}>
            <Button style={{ marginLeft: "auto" }} onClick={onClose}>
              Close
            </Button>
            <Button onClick={validate}>Validate</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

function getComponentInput(type: string, setValue: (value: string) => void) {
  switch (type) {
    case "price":
      return (
        <Input
          type="number"
          placeholder="Price"
          onChange={(e) => setValue(e.target.value)}
        />
      );
    case "rating":
      return (
        <Input
          type="number"
          placeholder="Rating"
          onChange={(e) => setValue(e.target.value)}
        />
      );
    case "condition":
      return (
        <Select
          onChange={(e) => setValue(e.target.value)}
          defaultValue=""
          displayEmpty
          inputProps={{ "aria-label": "Condition" }}
        >
          <option value="" disabled>
            Select Condition
          </option>
          <option value="new">New</option>
          <option value="mint">Mint</option>
          <option value="used">Used</option>
          <option value="damaged">Damaged</option>
        </Select>
      );
    default:
      return null;
  }
}
