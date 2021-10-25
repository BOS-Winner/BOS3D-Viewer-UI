/* eslint-disable camelcase */
import * as fileParser from '../index';
import { FILE_SEP, IMPORT_ERR_MSG, IMPORT_ERR_TYPE } from '../constant';
import json1_3_0 from "./json1_3_0";
import json1_2_0 from './json1_2_0';
import record1_4_0 from "./record1_4_0";
import record1_3_0 from './record1_3_0';
import record1_2_0 from './record1_2_0';
import record1_0 from './record1_0';

describe('roam fileParser', () => {
  it('should convert json to record', () => {
    const rst = fileParser.json2yjbos3dRecord(json1_3_0);
    expect(rst).toBe(record1_4_0);
  });

  it('should convert record to json', () => {
    let rst = fileParser.yjbos3dRecord2json(record1_3_0);
    expect({
      ...rst.info,
      keyFrameList: rst.keyFrameList,
    })
      .toEqual(json1_3_0);

    rst = fileParser.yjbos3dRecord2json(record1_2_0);
    expect({
      ...rst.info,
      keyFrameList: rst.keyFrameList,
    })
      .toEqual(json1_2_0);

    rst = fileParser.yjbos3dRecord2json(record1_0);
    expect(rst).toMatchSnapshot();
  });

  it('should throw error', () => {
    let errRecord = `-1${record1_0.slice(3)}`;
    expect(() => {
      fileParser.yjbos3dRecord2json(errRecord);
    })
      .toThrow(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);

    errRecord = record1_2_0.slice(0, 10) + FILE_SEP + FILE_SEP;
    expect(() => {
      fileParser.yjbos3dRecord2json(errRecord);
    })
      .toThrow(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);

    errRecord = record1_2_0.slice(0, 200);
    expect(() => {
      fileParser.yjbos3dRecord2json(errRecord);
    })
      .toThrow(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);
  });
});
