// used for procedural generation of system

const makeSystem = () => {
    const namePrefix = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
        'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
        'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
    const stationSuffix = ['Station', 'Hub', 'Port', 'Mining', 'Factory', 'Research', 'Academy'];

    const randomNamePrefix = () => {
        return namePrefix[Math.floor(Math.random() * namePrefix.length)];
    };

    const randomStationSuffix = () => {
        return stationSuffix[Math.floor(Math.random() * stationSuffix.length)];
    };

    const usedSystemNames = [];
    const randomSystemName = () => {
        let name = `${randomNamePrefix()}-${Math.floor(Math.random() * 9)}`;
        while (usedSystemNames.includes(name)) {
            name = `${randomNamePrefix()}-${Math.floor(Math.random() * 9)}`;
        }
        usedSystemNames.push(name);
        return name;
    };

    const usedStationNames = [];
    const randomStation = () => {
        const pos = new Vec(Math.random() * 600 + 100, Math.random() * 600 + 100);
        let name = `${randomNamePrefix()} ${randomStationSuffix()}`;
        while (usedStationNames.includes(name)) {
            name = `${randomNamePrefix()} ${randomStationSuffix()}`;
        }
        usedStationNames.push(name);
        return new Station(name, pos);
    };

    // create systems
    const A = new System(randomSystemName(), COLOR.RED, [randomStation()]);
    const B = new System(randomSystemName(), COLOR.GREEN, [randomStation()]);
    const C = new System(randomSystemName(), COLOR.BLUE, [randomStation()]);

    // create gates connecting systems
    const gateA_B = new Gate('Gate to ' + B.name, new Vec(400, 250), B);
    const gateB_A = new Gate('Gate to ' + A.name, new Vec(200, 250), A);
    const gateA_C = new Gate('Gate to ' + C.name, new Vec(600, 200), C);
    const gateC_A = new Gate('Gate to ' + A.name, new Vec(300, 150), A);
    const gateB_C = new Gate('Gate to ' + C.name, new Vec(500, 300), C);
    const gateC_B = new Gate('Gate to ' + B.name, new Vec(350, 400), B);

    // add stations and gates as warpables
    A.warpables = [A.stations[0], gateA_B, gateA_C];
    B.warpables = [B.stations[0], gateB_A, gateB_C];
    C.warpables = [C.stations[0], gateC_A, gateC_B];

    // Create instances for each warpable
    A.createInstances();
    B.createInstances();
    C.createInstances();
    A.setCurrentInstance(A.stations[0]);

    return A;
}
