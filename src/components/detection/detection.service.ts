import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import { readFileSync } from 'fs';
import { config } from "dotenv";
import { FileUtils } from 'src/utils/file_utils';
import { Kwargs } from '@tensorflow/tfjs-layers/dist/types';

class CustomConv1D extends tf.layers.Layer {
  static className = 'CustomConv1D';
  conv1d: tf.layers.Layer;
  maxPool1d: tf.layers.Layer;
  dense1: tf.layers.Layer;
  dense2: tf.layers.Layer;

  constructor() {
    super();
    this.conv1d = tf.layers.conv1d({
      filters: 256,
      kernelSize: 3,
      activation: 'tanh',
    });
    this.maxPool1d = tf.layers.globalMaxPool1d();
    this.dense1 = tf.layers.dense({
      units: 32,
      activation: 'relu',
    });
    this.dense2 = tf.layers.dense({
      units: 32,
      activation: 'relu',
    });
  }

  call(
    inputs: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[],
    kwargs: Kwargs,
  ): tf.Tensor | tf.Tensor[] {
    const conv1d_output = this.conv1d.call(inputs, kwargs);
    const max_pool1d_output = this.maxPool1d.call(conv1d_output, kwargs);
    const dense_output = this.dense1.call(max_pool1d_output, kwargs);
    return this.dense2.call(dense_output, kwargs);
  }
}

@Injectable()
export class DetectionService {
  vocabData: object;
  modelName: string;
  model: tf.LayersModel | null = null;

  // constructor() {
  //   config();
  //   this.loadModel();
  // }

  async loadModel() {
    config();
    tf.serialization.registerClass(CustomConv1D);
    const vocabDataPath = FileUtils.toRelativePath(process.env.VOCAB_FILE_PATH);
    const rawVocabData = readFileSync(vocabDataPath, 'utf-8');
    this.vocabData = JSON.parse(rawVocabData);

    this.modelName = FileUtils.toRelativePath(process.env.MODEL_FILE_PATH);
    this.model = await tf.loadLayersModel('file://' + this.modelName);
  }

  tokenize(message: string): number[] {
    return message
      .split('')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0)
      .map((e: string) => this.vocabData[e] || 0);
  }

  padSequence(sequence: number[]): number[] {
    const paddedSequence = new Array(300).fill(0);
    const startIndex = paddedSequence.length - sequence.length;
    sequence.forEach((value, index) => {
      paddedSequence[startIndex + index] = value;
    });

    return paddedSequence;
  }

  async isUrlMalicious(url: string): Promise<boolean> {
    if (this.model === null) {
      await this.loadModel();
    }

    const result = tf.tidy(() => {
      const sequence = this.padSequence(this.tokenize(url));
      return this.model.predict(tf.tensor2d(sequence, [1, sequence.length]));
    });

    let resultArray;
    if (result instanceof tf.Tensor) {
      resultArray = result.arraySync();
    } else {
      resultArray = result;
    }

    console.log(resultArray);
    return resultArray[0][0] >= resultArray[0][1];
  }
}
