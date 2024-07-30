import React, { useContext, useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { AppContext } from '../context/AppContext';
import { stations } from '../SampleData';

const unitOptions = ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'];
// const stationOptions = ['VOBL', 'Station2', 'Station3']; // Example station options

interface FormData {
  stationCity: string;
  stationName: string;
  stationCode: string;
  unitsApplicable: string[];
}

const resolver: Resolver<FormData> = async (values) => {
  const errors: any = {};

  if (!values.stationCode) {
    errors.stationCode = {
      type: 'required',
      message: 'Station Name is required.',
    };
  }

  if (!values.unitsApplicable || values.unitsApplicable.length === 0) {
    errors.unitsApplicable = {
      type: 'required',
      message: 'At least one unit is required.',
    };
  }

  return {
    values:
      values.stationCode &&
      values.unitsApplicable &&
      values.unitsApplicable.length > 0
        ? values
        : {},
    errors,
  };
};

function StationSettings() {
  const appContext = useContext(AppContext);
  const { settings, handleSaveSetting } = appContext || {};
  const [isEditingStn, setIsEditingStn] = useState(false);
  const [isEditingUnits, setIsEditingUnits] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      stationCode: settings?.stationCode || '',
    },
  });

  const { register: registerUnits, handleSubmit: handleSubmitUnits } = useForm({
    defaultValues: {
      unitsApplicable: settings?.unitsApplicable || [],
    },
  });

  const onSubmitStation = handleSubmit((data) => {
    const station = stations.find(
      (station) => station.code === data.stationCode,
    );
    if (station) {
      data.stationName = station.name;
      data.stationCity = station.city;
    }
    if (handleSaveSetting) {
      handleSaveSetting({ ...settings, ...data });
    }
    setIsEditingStn(false); // Close the form after saving
  });

  const onSubmitUnits = handleSubmitUnits((data) => {
    if (handleSaveSetting) {
      handleSaveSetting({ ...settings, ...data });
    }
    setIsEditingUnits(false); // Close the form after saving
  });

  return (
    <div className="station-settings">
      <form onSubmit={onSubmitStation} className="station-settings-form">
        <div className="station-settings-title">ATS Station Name</div>
        <div className="station-settings-horizontal-container">
          <div className="station-settings-stationCode">
            {settings?.stationCode}
            <div className="station-settings-stationName">
              {settings?.stationName}
              <div className="station-settings-stationName">
                {settings?.stationCity}
              </div>
            </div>
          </div>
          <div className="station-settings-edit-container">
            {isEditingStn ? (
              <div>
                <div className="station-settings-btn-container">
                  <input
                    type="submit"
                    value="Save Station"
                    className="station-settings-buttons"
                  />
                </div>
                <select
                  {...register('stationCode')}
                  className="station-settings-select"
                >
                  <option value="">Select Station</option>
                  {stations.map((station) => (
                    <option key={station.code} value={station.code}>
                      {station.code} , {station.name}
                    </option>
                  ))}
                </select>
                {errors?.stationCode && <p>{errors.stationCode.message}</p>}
              </div>
            ) : (
              <div className="edit-text" onClick={() => setIsEditingStn(true)}>
                Click to edit
              </div>
            )}
          </div>
        </div>
      </form>

      <form onSubmit={onSubmitUnits} className="station-settings-form">
        <div className="station-settings-title">
          Units applicable to {settings?.stationCode}
        </div>
        <div className="station-settings-horizontal-container">
          <div className="station-settings-units-container">
            <ul>
              {settings?.unitsApplicable?.length > 0 ? (
                settings.unitsApplicable.map((unit, index) => (
                  <li key={index} className="station-settings-unit-list">
                    {unit}
                  </li>
                ))
              ) : (
                <li className="station-settings-unit-list">
                  No units Selected. Pls add applicable units to the station.
                </li>
              )}
            </ul>
          </div>
          {isEditingUnits ? (
            <div>
              <div className="station-settings-btn-container">
                <input
                  type="submit"
                  value="Save Units"
                  className="station-settings-buttons"
                />
              </div>
              {unitOptions.map((unit) => (
                <div key={unit} className="unit-options-container">
                  <label>
                    <input
                      type="checkbox"
                      {...registerUnits('unitsApplicable')}
                      value={unit}
                    />
                    {unit}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="edit-text" onClick={() => setIsEditingUnits(true)}>
              Click to edit
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default StationSettings;
