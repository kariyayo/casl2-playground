class FlagRegister
{
private :
  bool overflow_flag;
  bool zero_flag;
  bool sign_flag;
  void set_sf_zf(int value);

public :
  FlagRegister();
  bool of();
  bool zf();
  bool sf();
  void set(int value);
  void set_with_overflow_flag(int value, bool overflow_flag);
  void set_logical(int value);
  void set_by_cpa(int value);
  void set_logical_by_cpl(int value);
  std::string to_string();
};
