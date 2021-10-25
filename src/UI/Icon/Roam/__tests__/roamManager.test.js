import Roam from 'mock/BOS3D/Roam';
import RoamPlayer from 'mock/BOS3D/RoamPlayer';
import Viewer from 'BOS3D/Viewer';
import RoamManager from '../RoamManager';
import recordJson from '../fileParser/__tests__/json1_3_0';

let roamManager;

describe('roamManager', () => {
  beforeEach(() => {
    roamManager = new RoamManager({
      Roam,
      RoamPlayer,
      viewer: new Viewer(),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should add, remove and get roam', () => {
    roamManager.addRoute(recordJson);
    let route = roamManager.getRoute(recordJson.id);
    expect(route).toBeInstanceOf(Roam);
    expect(roamManager.getRoamPlayer(recordJson.id)).toBeInstanceOf(RoamPlayer);
    const blobData = roamManager.getBlobData(recordJson.id);
    expect(blobData.fileName).toContain(recordJson.name);
    expect(blobData.blob).toBeInstanceOf(Blob);

    roamManager.rmRoam(recordJson.id);
    route = roamManager.getRoute(recordJson.id);
    expect(route).toBeUndefined();
  });
});
