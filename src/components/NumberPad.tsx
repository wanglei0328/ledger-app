import './NumberPad.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export default function NumberPad({ value, onChange }: Props) {
  const handleKey = (key: string) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (value.includes('.') || value === '') return;
      onChange(value + '.');
      return;
    }
    // 限制小数点后两位
    if (value.includes('.')) {
      const decimal = value.split('.')[1];
      if (decimal && decimal.length >= 2) return;
    }
    // 限制最大 9 位数
    if (value.replace('.', '').length >= 9) return;
    // 不能以 0 开头（除了 0.xx）
    if (value === '0' && key !== '.') {
      onChange(key);
      return;
    }
    onChange(value + key);
  };

  return (
    <div className="number-pad">
      {KEYS.map((row, i) => (
        <div key={i} className="np-row">
          {row.map(key => (
            <button
              key={key}
              className={`np-key ${key === '⌫' ? 'np-key-del' : ''} ${key === '0' ? 'np-key-zero' : ''}`}
              onClick={() => handleKey(key)}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
