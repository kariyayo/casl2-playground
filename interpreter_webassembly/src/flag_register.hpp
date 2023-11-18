class FlagRegister
{
private :
  bool overflow_flag;
  bool zero_flag;
  bool sign_flag;
  void set_sf_zf(int16_t value);

public :
  FlagRegister();
  bool of();
  bool zf();
  bool sf();
  void set(int16_t value);
  void set_with_overflow_flag(int16_t value, bool overflow_flag);
  void set_logical(uint16_t value);
  void set_by_cpa(int16_t value);
  void set_logical_by_cpl(int16_t value);
  std::string to_string();
};
