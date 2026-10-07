import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { MathInput } from "./mathInput";
import { MathField } from "../types/types";
const meta = {
  title: "UI/MathInput",
  component: MathInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof MathInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const NoKeysInput = ({
  isPaddingPersistent,
}: {
  isPaddingPersistent?: boolean;
}) => {
  const [value, setValue] = useState("");
  const mf = useRef<MathField>();
  return (
    <MathInput
      setValue={setValue}
      setMathfieldRef={(mathfield) => (mf.current = mathfield)}
      lang="en"
      numericToolbarKeys={[]}
      timesShouldProduceStar={true}
      isPaddingPersistent={isPaddingPersistent}
    />
  );
};
export const NoKeys: Story = {
  render: ({ isPaddingPersistent }: { isPaddingPersistent?: boolean }) => (
    <NoKeysInput isPaddingPersistent={isPaddingPersistent} />
  ),
};

// Belgian notation: the multiplication key writes \cdot ("3·x")
const CdotInput = () => {
  const [value, setValue] = useState("");
  return (
    <>
      <MathInput
        setValue={setValue}
        lang="fr"
        numericToolbarKeys={["cdot", "times"]}
        timesShouldProduceCdot={true}
      />
      <p>{value}</p>
    </>
  );
};
export const MultiplicationDot: Story = {
  render: () => <CdotInput />,
};

const SomeKeysInput = () => {
  const [value, setValue] = useState("");
  const mf = useRef<MathField>();
  return (
    <>
      {" "}
      <MathInput
        setValue={setValue}
        setMathfieldRef={(mathfield) => (mf.current = mathfield)}
        lang="en"
        numericToolbarKeys={[
          {
            id: "custom",
            label: "wow",
            labelType: "raw",
            mathfieldInstructions: {
              content:
                "\\frac{\\int_a^b 2\\pi e^{2ix}\\cos(\\theta) \\gamma}{\\sum_2^9 i^2 - 1}",
              method: "write",
            },
          },
          {
            id: "custom",
            label: "custom logic",
            labelType: "raw",
            onClick: () => alert("Clicked!"),
          },
          "ou",
          "cm2",
          "cos",
          "exp",
          "km2",
          "overlineC",
        ]}
      />
      <div>Latex : {value}</div>
    </>
  );
};

export const SomeKeys: Story = {
  render: () => <SomeKeysInput />,
};

const AllKeysInput = () => {
  const [value, setValue] = useState("");
  const mf = useRef<MathField>();
  return (
    <MathInput
      setValue={setValue}
      setMathfieldRef={(mathfield) => (mf.current = mathfield)}
      lang="en"
      // forbidPaste
      // withShowKeyboardButton
    />
  );
};
export const AllKeys: Story = {
  render: () => <AllKeysInput />,
};

const ManyKeyboardsInput = () => {
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const mf = useRef<MathField>();
  return (
    <>
      <MathInput
        setValue={setValue}
        setMathfieldRef={(mathfield) => (mf.current = mathfield)}
        lang="en"
        // forbidPaste
        // withShowKeyboardButton
      />
      <MathInput
        setValue={setValue2}
        lang="en"
        // forbidPaste
        // withShowKeyboardButton
      />
    </>
  );
};
export const ManyKeyboards: Story = {
  render: () => <ManyKeyboardsInput />,
};

const TableOfKeyboardsInput = () => {
  return (
    <table>
      {[0, 1, 2, 3].map((i) => (
        <tr style={{ height: 80 }}>
          {[0, 1, 2].map((i2) => (
            <td>
              <NoKeysInput isPaddingPersistent />
            </td>
          ))}
        </tr>
      ))}
    </table>
  );
};
export const TableOfKeyboards: Story = {
  render: () => (
    <div>
      {/* <div
        style={{
          borderRadius: "1rem",
          background: "aliceBlue",
          height: 300,
          width: "100%",
        }}
      /> */}
      <TableOfKeyboardsInput />
    </div>
  ),
};
