import React, { useContext } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { AppContext } from './AppContext';
import { stations } from './SampleData';

const unitOptions = ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'];
// const stationOptions = ['VOBL', 'Station2', 'Station3']; // Example station options

interface Station {
  code: string;
  name: string;
  city: string;
}

interface FormData {
  stationName: Station;
  unitsApplicable: string[];
}

const resolver: Resolver<FormData> = async (values) => {
  const errors: any = {};

  if (!values.stationName) {
    errors.stationName = {
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
      values.stationName &&
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
  console.log(settings);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver,
    defaultValues: {
      stationName: settings?.stationName || {},
      unitsApplicable: settings?.unitsApplicable || [],
    },
  });
  const onSubmit = handleSubmit((data) => {
    console.log(data);
    if (handleSaveSetting) {
      handleSaveSetting(data);
    }
  });

  return (
    <div className="station-settings">
      <form onSubmit={onSubmit} className="station-settings-form">
        <div className="station-settings-title">ATS Station Name</div>
        <div className="station-settings-horizontal-container">
          <div className="station-settings-stationName">
            {settings?.stationName}
          </div>
          <div>
            <select {...register('stationName')}>
              <option value="">Select Station</option>
              {stations.map((station) => (
                <option key={station.code} value={JSON.stringify(station)}>
                  {station.code} - {station.name}
                </option>
              ))}
            </select>
            {errors?.stationName && <p>{errors.stationName.message}</p>}
          </div>
        </div>

        <div className="station-settings-title">
          Units applicable to {settings?.stationName}
        </div>
        <div className="station-settings-horizontal-container">
          <div>
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
          <div>
            {unitOptions.map((unit) => (
              <div key={unit}>
                <label>
                  <input
                    type="checkbox"
                    {...register('unitsApplicable')}
                    value={unit}
                  />
                  {unit}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="station-settings-btn-container">
          <button type="button" className="station-settings-buttons">
            Edit
          </button>
          <input
            type="submit"
            value="Save"
            className="station-settings-buttons"
          />
        </div>
      </form>
    </div>
  );
}

export default StationSettings;
