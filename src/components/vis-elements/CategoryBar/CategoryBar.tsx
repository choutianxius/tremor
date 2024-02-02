"use client";
import React from "react";
import Tooltip, { useTooltip } from "components/util-elements/Tooltip/Tooltip";
import {
  getColorClassNames,
  makeClassName,
  sumNumericArray,
  themeColorRange,
  tremorTwMerge,
} from "lib";
import { colorPalette } from "lib/theme";
import { Color } from "../../../lib";

const makeCategoryBarClassName = makeClassName("CategoryBar");

const getMarkerBgColor = (
  markerValue: number | undefined,
  values: number[],
  colors: Color[],
): string => {
  if (markerValue === undefined) return "";

  let prefixSum = 0;
  for (let i = 0; i < values.length; i++) {
    const currentWidthPercentage = values[i];
    const currentBgColor = getColorClassNames(colors[i], colorPalette.background).bgColor;

    prefixSum += currentWidthPercentage;
    if (prefixSum >= markerValue) return currentBgColor;
  }

  return "";
};

const BarLabels = ({
  values,
  labels,
}: {
  values: number[];
  labels?: (null | number | string)[];
}) => {
  const sumValues = sumNumericArray(values);
  let prefixSum = 0;
  let sumConsecutveHiddenLabels = 0;
  return (
    <div
      className={tremorTwMerge(
        makeCategoryBarClassName("labels"),
        // common
        "relative flex w-full text-tremor-default h-5 mb-2",
        // light
        "text-tremor-content",
        // dark
        "dark:text-dark-tremor-content",
      )}
    >
      {values.slice(0, values.length).map((widthPercentage, idx) => {
        prefixSum += widthPercentage;
        const showLabel =
          (widthPercentage >= 0.1 * sumValues || sumConsecutveHiddenLabels >= 0.09 * sumValues) &&
          sumValues - prefixSum >= 0.15 * sumValues &&
          prefixSum >= 0.1 * sumValues;
        sumConsecutveHiddenLabels = showLabel ? 0 : (sumConsecutveHiddenLabels += widthPercentage);
        const displayedLabel = labels ? labels[idx + 1] || prefixSum : prefixSum;

        return (
          <div
            key={`item-${idx}`}
            className="flex items-center justify-end"
            style={{ width: `${widthPercentage}%` }}
          >
            <span
              className={tremorTwMerge(showLabel ? "block" : "hidden", "left-1/2 translate-x-1/2")}
            >
              {displayedLabel}
            </span>
          </div>
        );
      })}
      <div className={tremorTwMerge("absolute bottom-0 flex items-center left-0")}>
        {labels ? labels[0] || 0 : 0}
      </div>
      <div className={tremorTwMerge("absolute bottom-0 flex items-center right-0")}>
        {labels ? labels[labels.length - 1] || sumValues : sumValues}
      </div>
    </div>
  );
};

export interface CategoryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  values: number[];
  colors?: Color[];
  markerValue?: number;
  markerText?: string | number;
  showLabels?: boolean;
  labels?: (null | string | number)[];
  tooltip?: string;
  showAnimation?: boolean;
}

const CategoryBar = React.forwardRef<HTMLDivElement, CategoryBarProps>((props, ref) => {
  const {
    values = [],
    colors = themeColorRange,
    markerValue,
    // markerText,
    showLabels = true,
    labels,
    tooltip,
    showAnimation = false,
    className,
    ...other
  } = props;

  const markerBgColor = getMarkerBgColor(markerValue, values, colors);

  const { tooltipProps, getReferenceProps } = useTooltip();

  return (
    <>
      <Tooltip text={tooltip} {...tooltipProps} />
      <div
        ref={ref}
        className={tremorTwMerge(makeCategoryBarClassName("root"), className)}
        {...other}
      >
        {showLabels ? <BarLabels values={values} labels={labels} /> : null}
        <div
          className={tremorTwMerge(
            makeCategoryBarClassName("barWrapper"),
            "relative w-full flex items-center h-2",
          )}
        >
          <div
            className={tremorTwMerge(
              // common
              "flex-1 flex items-center h-full overflow-hidden rounded-tremor-full",
            )}
          >
            {values.map((value, idx) => {
              const baseColor = colors[idx] ?? "gray";
              return (
                <div
                  key={`item-${idx}`}
                  className={tremorTwMerge(
                    makeCategoryBarClassName("categoryBar"),
                    "h-full",
                    getColorClassNames(baseColor, colorPalette.background).bgColor,
                  )}
                  style={{ width: `${value}%` }}
                />
              );
            })}
          </div>
          {markerValue !== undefined ? (
            <div
              ref={tooltipProps.refs.setReference}
              className={tremorTwMerge(
                makeCategoryBarClassName("markerWrapper"),
                "absolute right-1/2 -translate-x-1/2 w-5",
              )}
              style={{
                left: `${markerValue}%`,
                transition: showAnimation ? "all 1s" : "",
              }}
              {...getReferenceProps}
            >
              <div
                className={tremorTwMerge(
                  makeCategoryBarClassName("marker"),
                  // common
                  "ring-2 mx-auto rounded-tremor-full h-4 w-1",
                  // light
                  "ring-tremor-brand-inverted",
                  // dark
                  "dark:ring-dark-tremor-brand-inverted",
                  markerBgColor,
                )}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
});

CategoryBar.displayName = "CategoryBar";

export default CategoryBar;
