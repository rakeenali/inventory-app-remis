import React from "react";
import { Link } from "remix";

type Props = {
  heading: string;
  to: string;
  buttonText: string;
};

export const HeaderComponent: React.FC<Props> = ({
  heading,
  to,
  buttonText,
}) => {
  return (
    <div className="row">
      <div className="six columns">
        <h4>{heading}</h4>
      </div>
      <div className="four columns">&nbsp;</div>
      <div className="two columns">
        <Link className="button button-primary" to={to}>
          {buttonText}
        </Link>
      </div>
    </div>
  );
};
