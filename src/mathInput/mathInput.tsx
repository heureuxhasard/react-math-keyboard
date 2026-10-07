import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import { isMobile } from "react-device-detect";
import { Keyboard } from "../keyboard/keyboard";
import { MathField } from "../types/types";
import { MathFieldContext } from "./mathfieldContext";
import { KeyProps } from "../keyboard/keys/key";
import { ToolbarTabIds } from "../keyboard/toolbar/toolbarTabs";
import { KeyId } from "../keyboard/keys/keyIds";
import { Langs } from "../keyboard/keys/keyGroup";
import { KeysPropsMap } from "../keyboard/keys/keys";
import { KeyboardThemeColor } from "../style/keyboardTheme";
import { applyTheme } from "../style/applyTheme";
import { Portal } from "../components/portal";
import { ShowKeyboardButton } from "./showKeyboardButton";
import "./style.css";
import { embedObjects } from "./embedObjects";

export type MathInputProps = {
  numericToolbarKeys?: (KeyId | KeyProps)[];
  numericToolbarTabs?: ToolbarTabIds[];
  alphabeticToolbarKeys?: (KeyId | KeyProps)[];
  allowAlphabeticKeyboard?: boolean;
  setMathfieldRef?: (mf: MathField) => void;
  setClearRef?: (f: () => void) => void;
  initialLatex?: string;
  setValue?: (s: string) => void;
  divisionFormat?: "fraction" | "obelus";
  color?: KeyboardThemeColor;
  style?: React.CSSProperties;
  size?: "small" | "medium";
  rootElementId?: string;
  fullWidth?: boolean;
  container?: any;
  scrollType?: "window" | "raw";
  lang?: Langs;
  forbidOtherKeyboardKeys?: boolean;
  parenthesisShouldNotProduceLeftRight?: boolean;
  registerEmbedObjects?: {
    id: string;
    htmlString: string;
    text: string;
    latex: string;
  }[];
  tabShouldSkipKeys?: boolean;
  forbidPaste?: boolean;
  withShowKeyboardButton?: boolean;
  LoadingComponent?: React.FC;
  scrollTriesToShowLastElement?: boolean;
  closeKeyboardOnGoBack?: boolean;
  timesShouldProduceStar?: boolean;
  /** Multiplication key writes \cdot ("3·x", Belgian notation) instead of \times */
  timesShouldProduceCdot?: boolean;
  isPaddingPersistent?: boolean;
};

const vanillaKeys = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "-",
  ",",
  "(",
  ")",
  "²",
  "^",
  "*",
  "/",
];

const convertDoubleBackslashes = (str: string) => {
  return str.replace(/\\\\/g, "\\");
};

export const MathInput = ({
  numericToolbarKeys,
  numericToolbarTabs,
  alphabeticToolbarKeys,
  setValue,
  setMathfieldRef,
  setClearRef,
  style = {},
  initialLatex,
  rootElementId,
  divisionFormat = "fraction",
  parenthesisShouldNotProduceLeftRight = false,
  color = "grey",
  size = "medium",
  fullWidth = true,
  allowAlphabeticKeyboard = true,
  scrollType = "window",
  lang = "en",
  forbidOtherKeyboardKeys = false,
  registerEmbedObjects,
  tabShouldSkipKeys = false,
  forbidPaste = false,
  withShowKeyboardButton = false,
  LoadingComponent = () => <div>Loading...</div>,
  scrollTriesToShowLastElement = false,
  closeKeyboardOnGoBack = false,
  timesShouldProduceStar = false,
  timesShouldProduceCdot = false,
  isPaddingPersistent = false,
}: MathInputProps) => {
  const [loaded, setLoaded] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const mathfield = useRef<MathField>({} as MathField);

  const showKeyboardRequest = useRef<"close" | "open">();
  const timeout = useRef<any>(null);

  const suppressNextOpenRef = useRef(false);
  const request = (type: "close" | "open") => {
    if (type === "close" && showKeyboardRequest.current === "open") return;
    if (timeout.current) clearTimeout(timeout.current);

    showKeyboardRequest.current = type;
    const eventually = () => {
      // if (withShowKeyboardButton && showKeyboardRequest.current === "open")
      //   return;
      setShowKeyboard(showKeyboardRequest.current === "open");
      showKeyboardRequest.current = undefined;
    };
    timeout.current = setTimeout(eventually, 300);
  };

  const idCounter = useRef<number>(0);
  useEffect(() => {
    window.jQuery = $;
    require("mathquill4keyboard/build/mathquill.css");
    require("mathquill4keyboard/build/mathquill");
    let MQ = window.MathQuill.getInterface(2);
    embedObjects.forEach((obj) => {
      MQ.registerEmbed(obj.id, function registerObject() {
        return {
          htmlString: obj.htmlString,
          text: function text() {
            return obj.text;
          },
          latex: function latex() {
            return obj.latex;
          },
        };
      });
    });
    if (registerEmbedObjects) {
      registerEmbedObjects.forEach((obj) => {
        MQ.registerEmbed(obj.id, function registerObject() {
          return {
            htmlString: obj.htmlString,
            text: function text() {
              return obj.text;
            },
            latex: function latex() {
              return obj.latex;
            },
          };
        });
      });
    }

    const mf = MQ.MathField(spanRef.current, {
      handlers: {
        edit: function (a: any) {
          setValue?.(mf.latex());
        },
      },
      supSubsRequireOperand: true,
      maxDepth: 5,
      restrictMismatchedBrackets: true,
    }) as MathField;
    idCounter.current = MQ(spanRef.current).id;
    mathfield.current = mf;
    const textarea = mf.el().querySelector("textarea");
    isMobile && textarea?.setAttribute("readonly", "readonly");
    textarea?.addEventListener("focusin", (e) => {
      if (suppressNextOpenRef.current) {
        suppressNextOpenRef.current = false;
        return;
      }
      !withShowKeyboardButton && request("open");
    });
    setMathfieldRef?.(mf);
    setClearRef?.(() => mf.latex(""));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!forbidOtherKeyboardKeys || !loaded) return;
    let keys: (string | undefined)[] = [...vanillaKeys];
    if (numericToolbarKeys)
      keys.push(
        ...numericToolbarKeys.map((key) => {
          return typeof key === "string"
            ? KeysPropsMap.get(key)!.keypressId
            : key.keypressId;
        }),
      );

    keys = keys.filter((e) => e !== undefined);

    const exec = (event: KeyboardEvent) => {
      if (!keys.includes(event.key)) event.preventDefault();
    };
    const inputElement = document.getElementById(
      `mq-keyboard-${idCounter.current}-container`,
    );
    inputElement?.addEventListener("keypress", exec);
    return () => inputElement?.removeEventListener("keypress", exec);
  }, [forbidOtherKeyboardKeys, numericToolbarKeys, loaded]);

  // Physical "*" key: MathQuill writes \times; with timesShouldProduceCdot it writes \cdot
  // instead, like the on-screen multiplication key (Belgian notation "3·7").
  useEffect(() => {
    if (!timesShouldProduceCdot || !loaded) return;
    const exec = (event: KeyboardEvent) => {
      if (event.key !== "*") return;
      event.preventDefault();
      mathfield.current?.cmd("\\cdot");
    };
    const inputElement = document.getElementById(
      `mq-keyboard-${idCounter.current}-container`,
    );
    inputElement?.addEventListener("keypress", exec);
    return () => inputElement?.removeEventListener("keypress", exec);
  }, [timesShouldProduceCdot, loaded]);

  useEffect(() => {
    if (!forbidPaste || !loaded) return;
    const inputElement = document.getElementById(
      `mq-keyboard-${idCounter.current}-container`,
    );
    inputElement && (inputElement.onpaste = (e) => e.preventDefault());
  }, [forbidPaste, loaded]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        let isKeyboardClick = false;
        let isCloseKeyClick = false;
        let element: HTMLElement | null = e.target;
        while (element !== null) {
          if (element.id.includes("close")) isCloseKeyClick = true;
          if (element.id.includes(`mq-keyboard-${idCounter.current}`)) {
            isKeyboardClick = true;
            break;
          }
          element = element.parentElement;
        }
        if (!isKeyboardClick || isCloseKeyClick) {
          request("close");
        } else !withShowKeyboardButton && request("open");
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleKeyDown = (e: any) => {
    if (e.key === "Escape" && showKeyboard) {
      suppressNextOpenRef.current = true;
      request("close");

      return;
    }
  };

  const spanRef = useRef<HTMLSpanElement | null>(null);
  const wasInitialLatexSet = useRef(false);
  useEffect(() => {
    if (!loaded || !initialLatex) return;
    if (wasInitialLatexSet.current) return;
    mathfield.current.latex(convertDoubleBackslashes(initialLatex));
    wasInitialLatexSet.current = true;
  }, [loaded, initialLatex]);

  const handlePopState = (event: PopStateEvent) => {
    console.log(event);
    // If the keyboard is open, prevent default behavior and close it
    if (showKeyboard) {
      request("close");
      // Since we just went back, push the state forward again
      window.history.pushState({ keyboardOpen: true }, "");
    }
  };
  useEffect(() => {
    if (showKeyboard) {
      //--- navigator on go back close keyboard
      const keyboardContainerElements = document.getElementsByClassName(
        "react-math-keyboard-keyboard-container",
      );
      if (keyboardContainerElements.length <= 1) {
        window.history.pushState({ keyboardOpen: true }, "");
        if (closeKeyboardOnGoBack) {
          window.addEventListener("popstate", handlePopState);
        }
      }
      //---

      if (rootElementId) {
        $(`#${rootElementId}`).css("padding-bottom", `300px`);
      } else {
        $("body").css("padding-bottom", `300px`);
      }

      const currentMathInputTop = mathfield.current
        .el()
        .getBoundingClientRect().top;
      const deltaForCurrent = window.innerHeight - currentMathInputTop;

      const mathInputsList = document.getElementsByClassName(
        "react-math-keyboard-input",
      );
      if (scrollTriesToShowLastElement && mathInputsList.length) {
        const lastMathInput = mathInputsList[mathInputsList.length - 1];
        const lastMathInputTop = lastMathInput!.getBoundingClientRect().top;
        const deltaForLast = window.innerHeight - lastMathInputTop;
        const deltaBetweenInputs = lastMathInputTop - currentMathInputTop;

        if (deltaForLast < 400) {
          if (deltaBetweenInputs + 300 > window.innerHeight) {
            if (scrollType === "window") {
              window.scrollBy({
                top: currentMathInputTop,
                behavior: "smooth",
              });
            } else lastMathInput!.scrollIntoView({ behavior: "smooth" });
          } else {
            if (scrollType === "window")
              window.scrollBy({
                top: window.innerHeight - deltaForLast - 400,
                behavior: "smooth",
              });
            else mathfield.current.el().scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        if (deltaForCurrent < 400) {
          if (scrollType === "window")
            window.scrollBy({
              top: 400 - deltaForCurrent,
              behavior: "smooth",
            });
          else mathfield.current.el().scrollIntoView({ behavior: "smooth" });
        }
        if (deltaForCurrent > window.innerHeight - 30) {
          if (scrollType === "window") {
            window.scrollBy({ top: -50, behavior: "smooth" });
          } else mathfield.current.el().scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (isPaddingPersistent) {
      return;
    } else {
      if (rootElementId) {
        $(`#${rootElementId}`).css("padding-bottom", 0);
      } else {
        $("body").css("padding-bottom", 0);
      }
    }
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!isPaddingPersistent) {
        if (rootElementId) {
          $(`#${rootElementId}`).css("padding-bottom", 0);
        } else {
          $("body").css("padding-bottom", 0);
        }
      }
    };
  }, [showKeyboard, rootElementId, scrollType, closeKeyboardOnGoBack]);

  useEffect(() => {
    applyTheme(color);
  }, [color, showKeyboard]);

  const onForceHideKeyboard = () => {
    setShowKeyboard(false);
    // mathfield.current.blur();
  };

  const handleShowKeyboardButtonClick = () => {
    setShowKeyboard(true);
    mathfield.current.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
      id={`mq-keyboard-${idCounter.current}-container`}
      className="react-math-keyboard-input-container"
      onKeyDown={handleKeyDown}
    >
      {!loaded && <LoadingComponent />}
      <span
        className="react-math-keyboard-input"
        style={{ padding: size === "small" ? "8px 4px" : "12px 6px" }}
        id={`mq-keyboard-${idCounter.current}-field`}
        ref={spanRef}
      ></span>
      {withShowKeyboardButton && (
        <ShowKeyboardButton handleClick={handleShowKeyboardButtonClick} />
      )}
      <MathFieldContext.Provider value={mathfield.current}>
        <Portal open={showKeyboard}>
          {showKeyboard && (
            <Keyboard
              divisionFormat={divisionFormat}
              numericToolbarKeys={numericToolbarKeys}
              numericToolbarTabs={numericToolbarTabs}
              alphabeticToolbarKeys={alphabeticToolbarKeys}
              onHideKeyboard={onForceHideKeyboard}
              allowAlphabeticKeyboard={allowAlphabeticKeyboard}
              lang={lang}
              parenthesisShouldNotProduceLeftRight={
                parenthesisShouldNotProduceLeftRight
              }
              timesShouldProduceStar={timesShouldProduceStar}
              timesShouldProduceCdot={timesShouldProduceCdot}
              tabShouldSkipKeys={tabShouldSkipKeys}
            />
          )}
        </Portal>
      </MathFieldContext.Provider>
    </div>
  );
};
