import React, { useContext } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { AppContext } from './AppContext';

const unitOptions = ['ADC', 'APP', 'APP(S)', 'ACC', 'ACC(S)', 'OCC'];
const stationOptions = ['Station1', 'Station2', 'Station3']; // Example station options

interface FormData {
  stationName: string;
  unitsApplicable: string[];
}

const resolver: Resolver<FormData> = async (values) => {
  return {
    values:
      values.stationName &&
      values.unitsApplicable &&
      values.unitsApplicable.length > 0
        ? values
        : '',
    errors: {
      ...(!values.stationName && {
        stationName: {
          type: 'required',
          message: 'Station Name is required.',
        },
      }),
      ...(!values.unitsApplicable ||
        (values.unitsApplicable.length === 0 && {
          unitsApplicable: {
            type: 'required',
            message: 'At least one unit is required.',
          },
        })),
    },
  };
};

function EditUnits() {
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
      stationName: settings?.stationName || '',
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
    <div>
      <h2>Edit Units</h2>
      <form onSubmit={onSubmit}>
        <div>
          <select {...register('stationName')}>
            <option value="">Select Station</option>
            {stationOptions.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
          {errors?.stationName && <p>{errors.stationName.message}</p>}
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
        <input type="submit" />
      </form>
    </div>
  );
}

export default EditUnits;
