function pithouse2boxflat(pithousePresets, basePresets = {}) {
  if (pithousePresets?.deviceType !== 'Motor') {
    alert(`Unsupported device type "${pithousePresets?.deviceType}". Only wheel bases are supported.`);
    return;
  }

  if (pithousePresets.deviceParams?.version !== 2) {
    alert('Unsupported deviceParams version. Only v2 is supported.');
    return;
  }

  const base = deviceParams2base(pithousePresets.deviceParams);
  const main = deviceParams2main(pithousePresets.deviceParams);

  return {
    BoxflatPresetVersion: '1',
    base: { ...base, ...basePresets },
    main,
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const browseBtn = document.getElementById('browseBtn');
  const convertBtn = document.getElementById('convertBtn');
  const saveBtn = document.getElementById('saveBtn');
  const copyBtn = document.getElementById('copyBtn');
  const fileInput = document.getElementById('fileInput');
  const inputTextarea = document.getElementById('inputText');
  const outputTextarea = document.getElementById('outputText');
  const inputFilename = document.getElementById('inputFilename');

  const inertiaInput = document.getElementById('inertiaInput');
  const inertiaSlider = document.getElementById("inertiaSlider");
  const inertiaPresetBtns = document.querySelectorAll(".inertiaPresetBtn")
  const roadSensitivityInput = document.getElementById('roadSensitivityInput');

  const getPithousePresets = (throwOnError = true) => {
    try {
      return JSON.parse(inputTextarea.value.trim());
    } catch (e) {
      if (throwOnError) {
        throw e;
      }
      return null;
    }
  };

  inertiaInput.value = localStorage.getItem('inertiaValue') ?? inertiaInput.value;
  inertiaSlider.value = inertiaInput.value;

  inertiaInput.addEventListener('input', () => {
    inertiaSlider.value = inertiaInput.value;
    localStorage.setItem('inertiaValue', inertiaInput.value);
  });

  inertiaSlider.addEventListener("input", () => {
    inertiaInput.value = inertiaSlider.value;
    inertiaInput.dispatchEvent(new Event('input'));
  });

  inertiaPresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.value;
      inertiaSlider.value = v;
      inertiaInput.value = v;
      inertiaInput.dispatchEvent(new Event('input'));
    });
  });

  roadSensitivityInput.value = localStorage.getItem('roadSensitivityValue') ?? roadSensitivityInput.value;

  roadSensitivityInput.addEventListener('input', () => {
    localStorage.setItem('roadSensitivityValue', roadSensitivityInput.value);
  });

  browseBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      inputTextarea.value = e.target.result || '';
      inputFilename.textContent = file.name;

      convertBtn.click();
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  });

  convertBtn.addEventListener('click', () => {
    const boxflatPresets = pithouse2boxflat(getPithousePresets(), {
      'natural-inertia': inertiaInput.value * 1,
      'road-sensitivity': roadSensitivityInput.value * 10,
    });

    outputTextarea.value = jsyaml.dump(boxflatPresets);
  });

  saveBtn.addEventListener('click', () => {
    const pithousePresets = getPithousePresets(false);
    const text = outputTextarea.value || '';
    const filename = pithousePresets?.name ? `${pithousePresets.name}.yml` : 'base-presets.yml';
    const blob = new Blob([text], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', () => {
    const text = outputTextarea.value;

    if (!text.trim()) {
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        copyBtn.textContent = '✓ Copied';

        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      })
      .catch(() => alert('Failed to copy.'));
  });
})
