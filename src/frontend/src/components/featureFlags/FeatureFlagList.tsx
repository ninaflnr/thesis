import React, { useEffect, useState, useReducer } from "react";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { FeatureFlag } from "../../api/featureFlags/types";
import FeatureFlagItem from "./FeatureFlagItem";
import axios from "axios";

export type FeedbackAction =
  | { type: "success"; msg: string }
  | { type: "error"; msg: string }
  | { type: "reset" };
export type ExpandAction =
  | { type: "expand"; target: string }
  | { type: "collapse" };

export type Action = FeedbackAction | ExpandAction;
type State = {
  expand: {
    target: string;
  };
  feedback: {
    visible: boolean;
    variant: "success" | "error";
    msg: string;
  };
};

function feedbackReducer(state: State, action: Action): State {
  switch (action.type) {
    case "success": {
      return {
        ...state,
        feedback: {
          visible: true,
          variant: "success",
          msg: action.msg,
        },
      };
    }
    case "error": {
      return {
        ...state,
        feedback: { visible: true, variant: "error", msg: action.msg },
      };
    }
    case "reset": {
      return {
        ...state,
        feedback: {
          visible: false,
          msg: "",
          variant: state.feedback.variant,
        },
      };
    }
    case "expand": {
      return {
        ...state,
        expand: {
          target:
            state.expand.target === action.target ? "" : action.target,
        },
      };
    }
    case "collapse": {
      return { ...state, expand: { target: "" } };
    }
    default: {
      throw new Error(
        `Action ${JSON.stringify(action)} is not handled in [FeedbackReducer]!`
      );
    }
  }
}

export default function FeatureFlagList() {
  const [{ expand, feedback }, dispatch] = useReducer(feedbackReducer, {
    expand: { target: "" },
    feedback: { visible: false, msg: "", variant: "success" },
  });

  const [groupedFlags, setGroupedFlags] = useState<Record<string, FeatureFlag[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroupedFlags = async () => {
    try {
      const response = await axios.get(
        `${window.location.origin}/feature-flag-service/v1/flags/grouped`
      );
      setGroupedFlags(response.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Error fetching grouped flags:", err);
      setError("Failed to fetch feature flags.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupedFlags();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      {Object.entries(groupedFlags).map(([group, flags]) => {
        const modifiableFlags = flags.filter(flag => flag.isModifiable);

        if (modifiableFlags.length === 0) {
          return null;
        }

        return (
          <Box key={group || "Uncategorized"} mb={4}>
            <Typography variant="h4" gutterBottom>
              {group || "Uncategorized"}
            </Typography>
            {modifiableFlags.map(({ id, name, description, enabled, isModifiable }, idx) => (
              <FeatureFlagItem
                key={idx}
                flagId={id}
                enabled={enabled}
                description={description}
                name={name}
                isModifiable={isModifiable}
                expanded={expand.target === name}
                dispatchHandler={dispatch}
                onSuccess={fetchGroupedFlags}
              />
            ))}
          </Box>
        );
      })}

      {/* Snackbar for feedback */}
      <Snackbar
        open={feedback.visible}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        autoHideDuration={5000}
        onClose={(event, reason) => {
          if (reason !== "clickaway") {
            dispatch({ type: "reset" });
          }
        }}
      >
        <Alert
          severity={feedback.variant}
          variant="filled"
          onClose={() => dispatch({ type: "reset" })}
        >
          {feedback.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
