import { Response } from "express";

// success
export const sendSuccessResponse = (res: Response, message: string, data: any) => {
  res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      isCached: false,
      isNew: false,
      isUpdated: false,
    },
  });
};

//  errror
export const sendErrorResponse = (res: Response, message: string, error: any = null) => {
  res.status(500).json({
    success: false,
    message,
    error,
  });
};

export const sendNotFoundResponse = (res: Response, message: string) => {
  res.status(404).json({
    success: false,
    message,
    data: null,
  });
};

export const sendBadRequestResponse = (res: Response, message: string) => {
  res.status(400).json({
    success: false,
    message,
    data: null,
  });
};

