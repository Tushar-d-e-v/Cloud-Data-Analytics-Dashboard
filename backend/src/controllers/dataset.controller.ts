import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import DatasetService from '../services/dataset.service';

export const uploadDataset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetName, timeColumn, metricColumn } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const dataset = await DatasetService.uploadDataset(
      file,
      userId,
      datasetName,
      timeColumn,
      metricColumn
    );

    res.status(201).json({
      success: true,
      message: 'Dataset uploaded successfully',
      data: { dataset }
    });

  } catch (error: any) {
    console.error('Dataset upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload dataset'
    });
  }
};

export const getDatasets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const datasets = await DatasetService.getUserDatasets(userId);

    // Transform datasets to ensure rowCount and columnCount are present
    const transformedDatasets = datasets.map(dataset => {
      const datasetObj = dataset.toObject();
      return {
        ...datasetObj,
        rowCount: datasetObj.rowCount || datasetObj.recordCount || 0,
        columnCount: datasetObj.columnCount || datasetObj.columns?.length || 0
      };
    });

    res.json({
      success: true,
      data: { datasets: transformedDatasets }
    });

  } catch (error: any) {
    console.error('Get datasets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch datasets'
    });
  }
};

export const getDataset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId } = req.params;

    const dataset = await DatasetService.getDataset(datasetId, userId);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Transform dataset to ensure rowCount and columnCount are present
    const datasetObj = dataset.toObject();
    const transformedDataset = {
      ...datasetObj,
      rowCount: datasetObj.rowCount || datasetObj.recordCount || 0,
      columnCount: datasetObj.columnCount || datasetObj.columns?.length || 0
    };

    res.json({
      success: true,
      data: { dataset: transformedDataset }
    });

  } catch (error: any) {
    console.error('Get dataset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dataset'
    });
  }
};

export const deleteDataset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId } = req.params;

    await DatasetService.deleteDataset(datasetId, userId);

    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete dataset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete dataset'
    });
  }
};

export const reprocessDataset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId } = req.params;

    const dataset = await DatasetService.reprocessDataset(datasetId, userId);

    res.json({
      success: true,
      message: 'Dataset reprocessing started',
      data: { dataset }
    });

  } catch (error: any) {
    console.error('Reprocess dataset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reprocess dataset'
    });
  }
};